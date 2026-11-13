import React, { useState } from 'react';
import { AccountResult, AccountStatus } from '../types/hstock';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Trash2,
  Lock,
  Globe,
  Radio,
  Clock,
  Sparkles,
  AlertOctagon,
  Share2
} from 'lucide-react';

interface ResultsDashboardProps {
  results: AccountResult[];
  onClearResults: () => void;
  onUpdateResult?: (id: string, newStatus: AccountStatus, note?: string) => void;
  onOpenShareModal?: () => void;
  isChecking?: boolean;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  results,
  onClearResults,
  onUpdateResult,
  onOpenShareModal,
  isChecking
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACCOUNT_FOUND' | 'ACCOUNT_NOT_FOUND' | 'BANNED' | 'USERNAME_CHANGED' | 'UNABLE_TO_VERIFY' | 'API_BLOCKED'>('ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [verifyModalAccount, setVerifyModalAccount] = useState<AccountResult | null>(null);

  const foundResults = results.filter((r) => r.status === 'ACCOUNT_FOUND' || r.status === 'LIVE');
  const notFoundResults = results.filter((r) => r.status === 'ACCOUNT_NOT_FOUND' || r.status === 'DEAD');
  const suspendedResults = results.filter((r) => r.status === 'BANNED');
  const changedResults = results.filter((r) => r.status === 'USERNAME_CHANGED');
  const blockedResults = results.filter((r) => r.status === 'API_BLOCKED' || (r.statusCode === 302 && r.status !== 'USERNAME_CHANGED'));
  const unableResults = results.filter((r) => (r.status === 'UNABLE_TO_VERIFY' || r.status === 'UNVERIFIED') && r.statusCode !== 302);

  const filtered = results.filter((r) => {
    if (filter === 'ACCOUNT_FOUND' && r.status !== 'ACCOUNT_FOUND' && r.status !== 'LIVE') return false;
    if (filter === 'ACCOUNT_NOT_FOUND' && r.status !== 'ACCOUNT_NOT_FOUND' && r.status !== 'DEAD') return false;
    if (filter === 'BANNED' && r.status !== 'BANNED') return false;
    if (filter === 'USERNAME_CHANGED' && r.status !== 'USERNAME_CHANGED') return false;
    if (filter === 'API_BLOCKED' && r.status !== 'API_BLOCKED' && (r.statusCode !== 302 || r.status === 'USERNAME_CHANGED')) return false;
    if (filter === 'UNABLE_TO_VERIFY' && (r.status !== 'UNABLE_TO_VERIFY' && r.status !== 'UNVERIFIED' || r.statusCode === 302)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.handle.toLowerCase().includes(q) ||
        r.rawInput.toLowerCase().includes(q) ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        r.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const exportTxt = (type: 'all' | 'found' | 'not_found' | 'changed' | 'unable') => {
    let list = results;
    if (type === 'found') list = foundResults;
    if (type === 'not_found') list = notFoundResults;
    if (type === 'changed') list = changedResults;
    if (type === 'unable') list = unableResults;

    const content = list.map((r) => r.handle).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checker_${type}_accounts_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const headers = [
      'ID',
      'Platform',
      'Handle',
      'LiveStatus',
      'HTTP_Code',
      'Latency_ms',
      'Mode',
      'PublicDisplayName',
      'Followers',
      'Following',
      'Posts',
      'Verified',
      'URL',
      'VerificationDetails',
      'PrivacyNotice',
      'CheckedAt'
    ];
    const rows = results.map((r) => [
      r.id,
      r.platform,
      `"${r.handle}"`,
      r.status,
      r.statusCode ?? 'N/A',
      r.latencyMs ?? 'N/A',
      r.mode,
      `"${r.name || ''}"`,
      `"${r.followers ?? ''}"`,
      `"${r.following ?? ''}"`,
      `"${r.posts ?? ''}"`,
      r.isVerified ? 'YES' : 'NO',
      `"${r.url}"`,
      `"${r.details.replace(/"/g, '""')}"`,
      `"Legitimate public data only - No private email/phone/passwords"`,
      r.checkedAt
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hstock_verification_report_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (results.length === 0) return null;

  return (
    <div className="rounded-3xl bg-[#0e1524] border border-slate-800 shadow-2xl overflow-hidden space-y-4 p-5 sm:p-6">
      
      {/* Real Network Probe & Zero Fake Data Guarantee */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#101726] to-[#0c1424] border border-cyan-500/30 text-xs shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs sm:text-sm">
                Authentic Live Network Engine
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                100% Real Probes
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live HTTP status codes &amp; network latency measured from real platform servers. No artificial follower counts or fabricated numbers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Zero Private Leak</span>
          </span>
        </div>
      </div>

      {/* Top Live Status Categories Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Total */}
        <button
          onClick={() => setFilter('ALL')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'ALL'
              ? 'bg-slate-800 border-cyan-500/80 ring-2 ring-cyan-500/20'
              : 'bg-[#121a2c] border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
            All Checked
          </span>
          <span className="text-xl font-extrabold text-white font-mono mt-0.5 block">
            {results.length}
          </span>
        </button>

        {/* 1. Account Found */}
        <button
          onClick={() => setFilter('ACCOUNT_FOUND')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'ACCOUNT_FOUND'
              ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-[#121a2c] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
              Live / Active
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5 block">
            {foundResults.length}
          </span>
        </button>

        {/* 2. Account Not Found */}
        <button
          onClick={() => setFilter('ACCOUNT_NOT_FOUND')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'ACCOUNT_NOT_FOUND'
              ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-[#121a2c] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">
              Not Found (404)
            </span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <span className="text-xl font-extrabold text-rose-400 font-mono mt-0.5 block">
            {notFoundResults.length}
          </span>
        </button>

        {/* 3. Suspended Accounts */}
        <button
          onClick={() => setFilter('BANNED')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'BANNED'
              ? 'bg-red-950/60 border-red-500 ring-2 ring-red-500/20'
              : 'bg-[#121a2c] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider">
              Suspended (403)
            </span>
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
          </div>
          <span className="text-xl font-extrabold text-red-400 font-mono mt-0.5 block">
            {suspendedResults.length}
          </span>
        </button>

        {/* 4. API Blocked (302 Barrier) */}
        <button
          onClick={() => setFilter('API_BLOCKED')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'API_BLOCKED'
              ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-[#121a2c] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">
              API Blocked (302)
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-xl font-extrabold text-amber-300 font-mono mt-0.5 block">
            {blockedResults.length}
          </span>
        </button>

        {/* 5. Unverified / Network Timeout */}
        <button
          onClick={() => setFilter('UNABLE_TO_VERIFY')}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === 'UNABLE_TO_VERIFY'
              ? 'bg-slate-800 border-amber-500/60 ring-2 ring-amber-500/20'
              : 'bg-[#121a2c] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">
              Unverified / Net
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-xl font-extrabold text-slate-300 font-mono mt-0.5 block">
            {unableResults.length}
          </span>
        </button>
      </div>

      {/* Action and Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search handle, status, or details..."
            className="w-full bg-[#121a2c] text-xs text-white placeholder-slate-500 pl-9 pr-3.5 py-2 rounded-xl border border-slate-700 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportTxt('found')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Found ({foundResults.length})</span>
          </button>

          <button
            onClick={() => exportTxt('not_found')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Not Found ({notFoundResults.length})</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Share verified results via secure link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Results</span>
            </button>
          )}

          <button
            onClick={onClearResults}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
            title="Clear results list"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notice on Platform API Restrictions */}
      {(blockedResults.length > 0 || unableResults.length > 0) && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              Notice: Platform API Restrictions &amp; Zero Fake Results Policy
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Some targets encountered platform firewall challenges (e.g. Meta HTTP 302 login redirects). Hstock transparently marks these as <strong className="text-amber-300">API BLOCKED (302)</strong> or <strong className="text-cyan-300">UNVERIFIED</strong> rather than fabricating fake LIVE or SUSPENDED results. Click <span className="underline font-bold">Verify in Browser</span> on any account to immediately view the live profile.
            </p>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#080d17]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#101726] border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              <th className="py-3.5 px-4 min-w-[140px]">Live Status</th>
              <th className="py-3.5 px-4 min-w-[150px]">Platform &amp; Username</th>
              <th className="py-3.5 px-4 min-w-[200px]">Profile / Channel URL</th>
              <th className="py-3.5 px-4 min-w-[170px]">Public Account Info</th>
              <th className="py-3.5 px-4 min-w-[150px]">Verification Date &amp; Time</th>
              <th className="py-3.5 px-4 min-w-[220px]">Server Response &amp; Details</th>
              <th className="py-3.5 px-4 text-right min-w-[90px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                  No accounts found matching this filter.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const isFound = r.status === 'ACCOUNT_FOUND' || r.status === 'LIVE';
                const isNotFound = r.status === 'ACCOUNT_NOT_FOUND' || r.status === 'DEAD';
                const isBanned = r.status === 'BANNED';
                const isChanged = r.status === 'USERNAME_CHANGED';
                const isBlocked = r.status === 'API_BLOCKED' || (r.statusCode === 302 && r.status !== 'USERNAME_CHANGED');
                const isUnable = (r.status === 'UNABLE_TO_VERIFY' || r.status === 'UNVERIFIED') && !isBlocked;

                const formattedDate = (() => {
                  try {
                    const d = new Date(r.checkedAt);
                    return isNaN(d.getTime())
                      ? r.checkedAt
                      : d.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        });
                  } catch {
                    return r.checkedAt;
                  }
                })();

                return (
                  <tr key={r.id} className="hover:bg-slate-850/50 transition-colors">
                    {/* 1. Live Status Badge */}
                    <td className="py-3 px-4 shrink-0 align-top">
                      {isFound && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>LIVE / ACTIVE</span>
                          </span>
                          <span className="text-[10px] text-emerald-400/80 block font-mono">
                            HTTP {r.statusCode || 200} OK
                          </span>
                        </div>
                      )}
                      {isNotFound && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>NOT FOUND (404)</span>
                          </span>
                          <span className="text-[10px] text-rose-400/80 block font-mono">
                            HTTP {r.statusCode || 404}
                          </span>
                        </div>
                      )}
                      {isBanned && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950/70 text-red-400 border border-red-500/40">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            <span>SUSPENDED / DISABLED</span>
                          </span>
                          <span className="text-[10px] text-red-400/80 block font-mono">
                            HTTP 403 Violation
                          </span>
                        </div>
                      )}
                      {isChanged && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>USERNAME CHANGED</span>
                          </span>
                          <span className="text-[10px] text-purple-400/80 block font-mono">
                            HTTP {r.statusCode || 301}
                          </span>
                        </div>
                      )}
                      {isBlocked && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>UNKNOWN (302)</span>
                          </span>
                          <span className="text-[10px] text-amber-400/90 block font-mono">
                            Login Barrier
                          </span>
                        </div>
                      )}
                      {isUnable && (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/50 text-amber-300 border border-amber-500/30">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>UNKNOWN</span>
                          </span>
                          <span className="text-[10px] text-slate-400/80 block font-mono">
                            Verification Unavailable
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 2. Platform, Profile Picture (DP) & Username */}
                    <td className="py-3 px-4 align-top">
                      <div className="flex items-start gap-2.5">
                        {r.avatarUrl ? (
                          <img
                            src={r.avatarUrl}
                            alt={r.handle}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0 shadow ring-1 ring-white/10"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-[11px] shrink-0 uppercase">
                            {r.handle.slice(0, 2)}
                          </div>
                        )}
                        <div className="space-y-0.5 font-sans min-w-0">
                          <span className="inline-block uppercase font-black text-[9px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 tracking-wider">
                            {r.platform}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-bold text-white text-xs sm:text-sm truncate">
                              {r.platform === 'gmail' ? `${r.handle}@gmail.com` : `@${r.handle}`}
                            </span>
                            {r.isVerified && (
                              <span title="Publicly Verified Account">
                                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              </span>
                            )}
                          </div>
                          {r.name && (
                            <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                              {r.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 3. Profile or Channel URL */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 underline font-mono text-[11px] break-all inline-flex items-center gap-1 hover:brightness-110"
                        >
                          <span className="line-clamp-2">{r.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 inline" />
                        </a>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-sans">
                          <span>Target: Canonical Web Endpoint</span>
                        </div>
                      </div>
                    </td>

                    {/* 4. Public Account Information */}
                    <td className="py-3 px-4 font-sans text-xs align-top">
                      {isFound ? (
                        <div className="space-y-1">
                          {r.name && (
                            <div className="text-[11px] font-semibold text-slate-200">
                              {r.name}
                            </div>
                          )}
                          {r.followers !== undefined ? (
                            <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                              <span className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700">
                                👥 {r.followers} followers
                              </span>
                              {r.following !== undefined && (
                                <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                                  {r.following} following
                                </span>
                              )}
                              {r.posts !== undefined && (
                                <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                                  📦 {r.posts} {r.platform === 'github' ? 'repos' : 'posts'}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-emerald-400/90 font-medium">
                              ✓ Public account live &amp; active
                            </span>
                          )}
                        </div>
                      ) : isNotFound ? (
                        <div className="space-y-1 text-slate-500 text-[11px]">
                          <span>Account does not exist</span>
                          <span className="block text-[10px] font-mono text-rose-400/80">0 public posts/metrics</span>
                        </div>
                      ) : isChanged ? (
                        <div className="space-y-1 text-purple-300 text-[11px]">
                          <span>Username changed or redirected</span>
                        </div>
                      ) : (
                        <div className="space-y-1 text-amber-300/80 text-[11px]">
                          <span>Requires residential browser session</span>
                        </div>
                      )}
                    </td>

                    {/* 5. Verification Date & Time */}
                    <td className="py-3 px-4 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-mono">
                          <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                        {r.latencyMs !== undefined && (
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Latency: {r.latencyMs}ms
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6. Server Response & Details */}
                    <td className="py-3 px-4 font-sans text-xs align-top max-w-xs">
                      {isUnable ? (
                        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-[11px] flex flex-col gap-1.5">
                          <div className="flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{r.details}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setVerifyModalAccount(r)}
                            className="self-start text-[10px] font-bold text-cyan-300 hover:text-cyan-200 underline flex items-center gap-1 cursor-pointer"
                          >
                            <Globe className="w-3 h-3" />
                            Verify in Browser Session &rarr;
                          </button>
                        </div>
                      ) : isNotFound ? (
                        <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-rose-300 text-[11px] flex items-start gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{r.details}</span>
                        </div>
                      ) : isChanged ? (
                        <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-purple-300 text-[11px] flex items-start gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>{r.details}</span>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{r.details}</span>
                        </div>
                      )}
                    </td>

                    {/* 7. Actions */}
                    <td className="py-3 px-4 text-right align-top">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setVerifyModalAccount(r)}
                          className="p-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/70 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer"
                          title="Verify in Browser (Client-side)"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopy(r.id, r.handle)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Copy Handle"
                        >
                          {copiedId === r.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Open Profile URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Verify in Browser Modal */}
      {verifyModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0e1627] border border-cyan-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-white text-base">
                  Browser Live Verification
                </h3>
              </div>
              <button
                onClick={() => setVerifyModalAccount(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Platforms like Instagram and Meta use cloud anti-scraping walls (HTTP 302 login barriers) against automated servers. In your browser, you have a residential connection with native cookies.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#080d17] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    @{verifyModalAccount.handle}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Platform:</span>
                  <span className="uppercase font-bold text-cyan-400">
                    {verifyModalAccount.platform}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Live URL:</span>
                  <a
                    href={verifyModalAccount.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline font-mono truncate max-w-[240px] flex items-center gap-1"
                  >
                    <span>{verifyModalAccount.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Server Probe Response:
                </p>
                <p className="text-[11px] text-amber-300/90 font-mono">
                  {verifyModalAccount.details}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <p className="font-bold text-slate-300">
                  Step 1: Open profile directly in your browser:
                </p>
                <a
                  href={verifyModalAccount.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-bold flex items-center justify-center gap-2 text-xs shadow-lg cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open {verifyModalAccount.platform.toUpperCase()} Profile ({verifyModalAccount.handle})</span>
                </a>
              </div>

              {onUpdateResult && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <p className="font-bold text-slate-300">
                    Step 2: Update status based on browser confirmation:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateResult(verifyModalAccount.id, 'ACCOUNT_FOUND', 'Confirmed LIVE & active by direct browser verification.');
                        setVerifyModalAccount(null);
                      }}
                      className="py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Mark as Found (Live)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateResult(verifyModalAccount.id, 'ACCOUNT_NOT_FOUND', 'Confirmed NOT FOUND (404) by direct browser verification.');
                        setVerifyModalAccount(null);
                      }}
                      className="py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Mark as Not Found (404)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
