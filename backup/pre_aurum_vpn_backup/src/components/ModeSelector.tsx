import React from 'react';
import { CheckMode, PRICING } from '../types/checker';
import { CheckCircle2, Search, Zap, UserCheck } from 'lucide-react';

interface ModeSelectorProps {
  selectedMode: CheckMode;
  onSelectMode: (mode: CheckMode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
  disabled = false
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
          Check Mode & Pricing
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Mode 1: Account liveness */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectMode('liveness')}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between ${
            selectedMode === 'liveness'
              ? 'bg-gradient-to-br from-emerald-950/40 via-[#101927] to-[#0c121e] border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/20'
              : 'bg-[#101726] border-slate-800 hover:border-slate-700 hover:bg-[#131c2e]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-99'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedMode === 'liveness'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>✓ Account liveness</span>
                </h3>
                <p className="text-xs text-emerald-400/90 font-medium mt-0.5">
                  Live &middot; Dead &middot; Banned
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm sm:text-base font-extrabold text-white font-mono">
                ${PRICING.liveness.toFixed(4)}
              </span>
              <span className="text-[10px] text-slate-400 block font-normal">/acc</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Ultra-fast latency check
            </span>
            <span className="text-slate-500">200 OK / 404 / 403 status</span>
          </div>
        </button>

        {/* Mode 2: Account details */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectMode('details')}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between ${
            selectedMode === 'details'
              ? 'bg-gradient-to-br from-cyan-950/40 via-[#101927] to-[#0c121e] border-cyan-400 ring-2 ring-cyan-400/20 shadow-lg shadow-cyan-950/20'
              : 'bg-[#101726] border-slate-800 hover:border-slate-700 hover:bg-[#131c2e]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-99'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedMode === 'details'
                    ? 'bg-cyan-400 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Search className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>🔍 Account details</span>
                </h3>
                <p className="text-xs text-cyan-400/95 font-medium mt-0.5">
                  Name &middot; Followers &middot; Following &middot; Posts
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm sm:text-base font-extrabold text-white font-mono">
                ${PRICING.details.toFixed(4)}
              </span>
              <span className="text-[10px] text-slate-400 block font-normal">/acc</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-cyan-300 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              Comprehensive profile telemetry
            </span>
            <span className="text-slate-500">Public profile stats & bio</span>
          </div>
        </button>

      </div>
    </div>
  );
};
