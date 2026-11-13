import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  ExternalLink,
  Layers,
  ArrowLeft,
  Calendar,
  Lock,
  Sparkles
} from 'lucide-react';
import { hstockApi } from '../services/hstockApi';
import { AccountResult, SharedResultShare } from '../types/hstock';

interface SharedResultsViewProps {
  shareId: string;
  onExit: () => void;
}

export const SharedResultsView: React.FC<SharedResultsViewProps> = ({ shareId, onExit }) => {
  const [report, setReport] = useState<SharedResultShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'FOUND' | 'NOT_FOUND'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    hstockApi.getSharedResult(shareId)
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Shared report not found or expired.');
        setLoading(false);
      });
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d18] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center animate-spin">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-300">Loading Shared Verification Report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#080d18] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0c1220] p-6 rounded-3xl border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-white">Report Unavailable</h2>
          <p className="text-xs text-slate-400">{error || 'This shared link has expired or was revoked by its owner.'}</p>
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
          >
            Go to HSTOCK Account Checker
          </button>
        </div>
      </div>
    );
  }

  const results: AccountResult[] = report.results || [];

  const filteredResults = results.filter((r) => {
    const isFound = r.status === 'ACCOUNT_FOUND' || r.status === 'LIVE';
    if (filter === 'FOUND' && !isFound) return false;
    if (filter === 'NOT_FOUND' && isFound) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.handle.toLowerCase().includes(q) || (r.name && r.name.toLowerCase().includes(q));
    }
    return true;
  });

  const liveCount = results.filter((r) => r.status === 'ACCOUNT_FOUND' || r.status === 'LIVE').length;
  const deadCount = results.filter((r) => r.status === 'ACCOUNT_NOT_FOUND' || r.status === 'DEAD').length;

  const handleExportCSV = () => {
    const headers = ['Platform', 'Handle', 'Status', 'Name', 'Followers', 'URL', 'Details', 'Checked At'];
    const rows = results.map((r) => [
      r.platform,
      r.handle,
      r.status,
      r.name ? `"${r.name.replace(/"/g, '""')}"` : '',
      r.followers || '',
      r.url,
      r.details ? `"${r.details.replace(/"/g, '""')}"` : '',
      r.checkedAt
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hstock_${report.platform}_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-100 flex flex-col font-sans">
      {/* Top Banner */}
      <header className="border-b border-slate-800/80 bg-[#0a0f1d]/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Return to Main App"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md font-bold">
              <ShieldCheck className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white font-mono">HSTOCK</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  Shared Report
                </span>
              </div>
              <p className="text-[11px] text-slate-400">View-only verified account verification telemetry</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onExit}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
            >
              Open Checker
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* Title Header Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0d1627] to-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {report.platform.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{report.title}</h1>
              <p className="text-xs text-slate-400">
                Official verification snapshot of {results.length} accounts. Verified with live edge and official platform telemetry.
              </p>
            </div>

            {/* Metrics pills */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[80px]">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Total</span>
                <span className="text-lg font-black text-white font-mono">{results.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center min-w-[80px]">
                <span className="text-[9px] uppercase font-bold text-emerald-400 block">Live / Found</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{liveCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center min-w-[80px]">
                <span className="text-[9px] uppercase font-bold text-rose-400 block">Not Found</span>
                <span className="text-lg font-black text-rose-400 font-mono">{deadCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({results.length})
            </button>
            <button
              onClick={() => setFilter('FOUND')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'FOUND' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Found ({liveCount})
            </button>
            <button
              onClick={() => setFilter('NOT_FOUND')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'NOT_FOUND' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Not Found ({deadCount})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search handle or name..."
              className="w-full bg-slate-900 text-xs text-white placeholder-slate-500 pl-8 pr-3 py-2 rounded-xl border border-slate-800 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-2.5">
          {filteredResults.map((r) => {
            const isFound = r.status === 'ACCOUNT_FOUND' || r.status === 'LIVE';
            const isNotFound = r.status === 'ACCOUNT_NOT_FOUND' || r.status === 'DEAD';
            const isBanned = r.status === 'BANNED';

            return (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-[#0e1524] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {r.avatarUrl ? (
                    <img
                      src={r.avatarUrl}
                      alt={r.handle}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0 shadow ring-1 ring-white/10"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0 uppercase">
                      {r.handle.slice(0, 2)}
                    </div>
                  )}

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">
                        @{r.handle}
                      </span>
                      {r.name && (
                        <span className="text-slate-400 font-semibold truncate max-w-[180px]">
                          &bull; {r.name}
                        </span>
                      )}
                      {r.followers !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">
                          {r.followers} followers
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{r.details}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      isFound
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : isBanned
                        ? 'bg-red-950/70 text-red-400 border border-red-500/40'
                        : isNotFound
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-950/50 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isFound ? 'LIVE / ACTIVE' : isBanned ? 'SUSPENDED / DISABLED' : isNotFound ? 'NOT FOUND (404)' : 'UNKNOWN'}
                  </span>

                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white"
                      title="Open Profile"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
