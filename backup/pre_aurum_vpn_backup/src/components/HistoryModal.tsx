import React from 'react';
import { X, History, Download, Calendar, Layers, CheckCircle2, XCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { BatchHistory } from '../types/checker';

interface HistoryModalProps {
  history: BatchHistory[];
  onClose: () => void;
  onLoadBatch: (batch: BatchHistory) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  history,
  onClose,
  onLoadBatch
}) => {
  const downloadBatchCsv = (b: BatchHistory) => {
    const headers = ['Handle', 'Platform', 'Status', 'Mode', 'Name', 'Followers', 'Details'];
    const rows = b.results.map((r) => [
      `"${r.handle}"`,
      r.platform,
      r.status,
      r.mode,
      `"${r.name || ''}"`,
      `"${r.followers ?? ''}"`,
      `"${r.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_${b.id}_${b.platform}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#0e1626] rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Check History & Billing Logs
              </h3>
              <p className="text-xs text-slate-400">
                Audit trail of previous batches and cost deductions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {history.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Layers className="w-10 h-10 mx-auto text-slate-700" />
              <p className="text-xs">No verification history recorded yet.</p>
              <p className="text-[11px] text-slate-600">Run your first account check to populate logs.</p>
            </div>
          ) : (
            history.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                      {b.id}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {b.platform}
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {b.mode === 'liveness' ? '✓ Liveness' : '🔍 Details'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(b.timestamp).toLocaleString()}
                    </span>
                    <span className="font-mono font-bold text-rose-400">
                      -${b.cost.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Status counts & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">
                      {b.accountsCount} {b.accountsCount === 1 ? 'account' : 'accounts'}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold" title="Live / Active">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {b.liveCount}
                    </span>
                    <span className="flex items-center gap-1 text-rose-400 font-mono font-bold" title="Not Found">
                      <XCircle className="w-3.5 h-3.5" /> {b.deadCount}
                    </span>
                    {b.bannedCount > 0 && (
                      <span className="flex items-center gap-1 text-red-400 font-mono font-bold" title="Suspended">
                        <AlertOctagon className="w-3.5 h-3.5" /> {b.bannedCount}
                      </span>
                    )}
                    {((b.apiBlockedCount || 0) + (b.unverifiedCount || 0)) > 0 && (
                      <span className="flex items-center gap-1 text-amber-400 font-mono font-bold" title="API Blocked / Unverified">
                        <AlertTriangle className="w-3.5 h-3.5" /> {(b.apiBlockedCount || 0) + (b.unverifiedCount || 0)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLoadBatch(b)}
                      className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      View in Table
                    </button>
                    <button
                      onClick={() => downloadBatchCsv(b)}
                      className="px-3 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download CSV</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
