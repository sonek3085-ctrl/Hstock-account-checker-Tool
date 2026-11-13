import React from 'react';
import { Pause, Play, Square, Loader2 } from 'lucide-react';

interface VerificationProgressProps {
  current: number;
  total: number;
  currentItem?: string;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const VerificationProgress: React.FC<VerificationProgressProps> = ({
  current,
  total,
  currentItem,
  isPaused,
  onPause,
  onResume,
  onStop
}) => {
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1728] border border-cyan-500/40 shadow-xl space-y-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            {isPaused ? (
              <Pause className="w-4 h-4 text-amber-400" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {isPaused ? 'Verification Paused' : 'Verifying Accounts in Real-Time...'}
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                {current} / {total} ({percent}%)
              </span>
            </div>
            {currentItem && (
              <p className="text-xs text-slate-400 font-mono truncate max-w-xs sm:max-w-md mt-0.5">
                Probing: <span className="text-slate-200">{currentItem}</span>
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {isPaused ? (
            <button
              onClick={onResume}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-300" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Stop</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isPaused
              ? 'bg-amber-400'
              : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
