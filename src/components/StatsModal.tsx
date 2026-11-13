import React from 'react';
import { X, BarChart3, TrendingUp, DollarSign, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { BatchHistory, UserWallet } from '../types/checker';

interface StatsModalProps {
  history: BatchHistory[];
  wallet: UserWallet;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  history,
  wallet,
  onClose
}) => {
  // Aggregate data from history
  let totalChecked = 0;
  let totalLive = 0;
  let totalDead = 0;
  let totalBanned = 0;
  let totalSpend = wallet.totalSpent || 0;

  const platformCounts: Record<string, number> = {
    instagram: 0,
    twitter: 0,
    facebook: 0,
    tiktok: 0,
    threads: 0,
    gmail: 0,
    meta: 0
  };

  history.forEach((b) => {
    totalChecked += b.accountsCount;
    totalLive += b.liveCount;
    totalDead += b.deadCount;
    totalBanned += b.bannedCount;
    if (b.platform && platformCounts[b.platform] !== undefined) {
      platformCounts[b.platform] += b.accountsCount;
    }
  });

  if (totalChecked === 0 && wallet.totalChecks > 0) {
    totalChecked = wallet.totalChecks;
  }

  const liveRate = totalChecked > 0 ? ((totalLive / totalChecked) * 100).toFixed(1) : '0.0';
  const deadRate = totalChecked > 0 ? ((totalDead / totalChecked) * 100).toFixed(1) : '0.0';
  const bannedRate = totalChecked > 0 ? ((totalBanned / totalChecked) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#0e1626] rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                📊 Platform Verification Analytics
              </h3>
              <p className="text-xs text-slate-400">
                Performance metrics, success rate, and balance spend.
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

        {/* Top KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Total Checked
            </span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 block">
              {totalChecked}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Total Spent
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1 block">
              ${totalSpend.toFixed(4)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Live Rate
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1 block">
              {liveRate}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Dead / 404 Rate
            </span>
            <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono mt-1 block">
              {deadRate}%
            </span>
          </div>
        </div>

        {/* Quality Distribution Bar */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Overall Account Health Ratio</span>
            <span className="text-[11px] text-slate-400 font-normal">
              Based on {totalChecked} verified targets
            </span>
          </h4>

          {/* Visual Bar */}
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${liveRate}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Live: ${liveRate}%`}
            />
            <div
              style={{ width: `${deadRate}%` }}
              className="bg-rose-500 h-full transition-all"
              title={`Dead: ${deadRate}%`}
            />
            <div
              style={{ width: `${bannedRate}%` }}
              className="bg-amber-500 h-full transition-all"
              title={`Banned: ${bannedRate}%`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Live: {totalLive} ({liveRate}%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <XCircle className="w-3.5 h-3.5" />
              <span>Dead: {totalDead} ({deadRate}%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Banned: {totalBanned} ({bannedRate}%)</span>
            </div>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Checks by Target Platform
          </h4>

          <div className="space-y-2">
            {Object.entries(platformCounts).map(([plat, cnt]) => {
              const platPercent = totalChecked > 0 ? Math.round((cnt / totalChecked) * 100) : 0;
              return (
                <div
                  key={plat}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="capitalize font-bold text-white">{plat}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">{cnt} checks</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {platPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
