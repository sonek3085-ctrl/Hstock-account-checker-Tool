import React from 'react';
import { AppUser } from '../types/hstock';
import {
  ShieldCheck,
  Plus,
  History,
  BarChart3,
  Wallet,
  LogIn,
  User,
  LogOut,
  ShieldAlert,
  QrCode
} from 'lucide-react';

interface HeaderProps {
  user: AppUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenTopUp: () => void;
  onOpenHistory: () => void;
  onOpenStats: () => void;
  onOpenAdmin: () => void;
  pendingPaymentsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onOpenTopUp,
  onOpenHistory,
  onOpenStats,
  onOpenAdmin,
  pendingPaymentsCount = 0
}) => {
  const isAdmin = user?.role === 'admin';

  return (
    <header className="border-b border-slate-800/80 bg-[#0a0f1d]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white shrink-0 ring-1 ring-white/20">
            <ShieldCheck className="w-6 h-6 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
                <span>HSTOCK</span>
                <span className="text-xs font-sans font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Account Checker
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Real-time multi-platform status &amp; telemetry engine &bull; Binance USDT (BEP20) Settlement
            </p>
          </div>
        </div>

        {/* Right side Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          
          {/* Balance Widget */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-bold leading-none">
                Wallet Balance
              </span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono leading-tight">
                ${(user?.balance || 0).toFixed(4)} <span className="text-[10px] text-amber-400 font-normal">USDT</span>
              </span>
            </div>
          </div>

          {/* Add Balance (Binance USDT BEP20) */}
          <button
            onClick={onOpenTopUp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:brightness-110 text-slate-950 text-xs sm:text-sm font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <span className="font-mono text-sm">₮</span>
            <span>Deposit USDT (BEP20)</span>
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">History</span>
          </button>

          {/* Stats */}
          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Stats</span>
          </button>

          {/* Admin Panel Button (Admin Only) */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-lg shadow-rose-950/40"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Admin Panel</span>
              {pendingPaymentsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {pendingPaymentsCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                  {user.name.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs sm:text-sm font-bold shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login / Register</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
