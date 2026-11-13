import React from 'react';
import {
  X,
  AlertTriangle,
  Play,
  ShieldAlert,
  Wallet,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { SocialPlatform, CheckMode, AppUser, SystemSettings, PLATFORM_INFO } from '../types/hstock';

interface CheckConfirmationModalProps {
  platform: SocialPlatform;
  mode: CheckMode;
  accountCount: number;
  unitRate: number;
  totalCost: number;
  user: AppUser | null;
  settings: SystemSettings;
  onConfirm: () => void;
  onCancel: () => void;
  onOpenTopUp: () => void;
}

export const CheckConfirmationModal: React.FC<CheckConfirmationModalProps> = ({
  platform,
  mode,
  accountCount,
  unitRate,
  totalCost,
  user,
  settings,
  onConfirm,
  onCancel,
  onOpenTopUp
}) => {
  const isAdmin = user?.role === 'admin';
  const balance = user?.balance || 0;
  const remainingBalance = +(balance - totalCost).toFixed(4);
  const isInsufficient = !isAdmin && balance < totalCost;
  const shortfall = +(totalCost - balance).toFixed(4);

  const platformMeta = PLATFORM_INFO[platform];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#0d1424] rounded-3xl border border-amber-500/40 shadow-2xl p-6 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-mono flex items-center gap-2">
                <span>CONFIRM BATCH CHECK</span>
                {isAdmin && (
                  <span className="text-[10px] font-sans font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    👑 ADMIN FREE
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Review estimated verification cost and platform policies before debiting
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verification Summary Card */}
        <div className="p-4 rounded-2xl bg-[#080d18] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Target Platform:</span>
            <span className="font-bold text-white flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              {platformMeta.name} ({platformMeta.tag})
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Verification Mode:</span>
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {mode === 'details' ? '🔍 Account Details & Metrics' : '✓ Account Liveness (Live/Dead)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Batch Quantity:</span>
            <span className="font-mono font-bold text-white text-sm">
              {accountCount.toLocaleString()} {accountCount === 1 ? 'Account' : 'Accounts'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-400">Rate per Account:</span>
            <span className="font-mono text-slate-300">
              ${unitRate.toFixed(4)} USDT
            </span>
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-800/80">
            <span className="font-bold text-white">Estimated Total Cost:</span>
            <div className="text-right">
              {isAdmin ? (
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-xs line-through text-slate-500 font-mono">${(accountCount * unitRate).toFixed(4)}</span>
                  <span className="font-black text-amber-400 font-mono text-base">$0.0000 USDT</span>
                </div>
              ) : (
                <span className="font-black text-emerald-400 font-mono text-base">
                  ${totalCost.toFixed(4)} USDT
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Balance Comparison */}
        {!isAdmin && (
          <div className="p-3.5 rounded-2xl bg-[#090f1e] border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                Current Wallet Balance:
              </span>
              <span className="font-mono font-bold text-white">${balance.toFixed(4)} USDT</span>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60">
              <span className="text-slate-400">Balance After Verification:</span>
              <span
                className={`font-mono font-bold ${
                  remainingBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                ${remainingBalance >= 0 ? remainingBalance.toFixed(4) : '0.0000'} USDT
              </span>
            </div>
          </div>
        )}

        {/* Insufficient Balance Alert */}
        {isInsufficient && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Insufficient Balance for this Batch</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-200/90">
              You need an additional <strong className="font-mono font-bold">${shortfall} USDT</strong> to process {accountCount} accounts. Please deposit USDT (BEP20) to proceed.
            </p>
          </div>
        )}

        {/* Platform API Restriction Notice */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200/90 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Platform API Policy Notice</span>
          </div>
          <p className="leading-relaxed">
            Due to third-party anti-bot barriers or rate policies, some accounts may return login barriers (HTTP 302) or temporary blocks. Hstock will report them accurately as <strong className="text-amber-300">API_BLOCKED</strong> or <strong className="text-amber-300">UNVERIFIED</strong> &mdash; we never generate simulated or fake results.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>

          {isInsufficient ? (
            <button
              type="button"
              onClick={() => {
                onCancel();
                onOpenTopUp();
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <DollarSign className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Deposit via Binance USDT (BEP20)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950 stroke-none" />
              <span>Confirm &amp; Run Batch Check</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
