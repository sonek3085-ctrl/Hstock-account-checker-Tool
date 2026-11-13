import React from 'react';
import { ShieldCheck, Plus, History, BarChart3, Wallet } from 'lucide-react';

interface HeaderBarProps {
  balance: number;
  onOpenTopUp: () => void;
  onOpenHistory: () => void;
  onOpenStats: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  balance,
  onOpenTopUp,
  onOpenHistory,
  onOpenStats,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0c121e]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* App Title & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white shrink-0 ring-1 ring-cyan-400/30">
            <ShieldCheck className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Account checker</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Real-Time
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Verify account status in real time. Balance is deducted per check.
            </p>
          </div>
        </div>

        {/* Right side: Balance & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          
          {/* Balance Widget */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold leading-none">
                Balance
              </span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono leading-tight">
                ${balance.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Top up Button */}
          <button
            onClick={onOpenTopUp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Top up</span>
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>History</span>
          </button>

          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>📊 Stats</span>
          </button>

        </div>

      </div>
    </header>
  );
};
