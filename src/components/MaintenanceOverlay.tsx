import React from 'react';
import {
  Wrench,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Phone,
  MessageCircle,
  LogIn,
  Power
} from 'lucide-react';
import { SystemSettings, AppUser } from '../types/hstock';

interface MaintenanceOverlayProps {
  settings: SystemSettings;
  user: AppUser | null;
  onOpenAuth: () => void;
  onOpenContact: () => void;
  onDisableMaintenance: () => void;
}

export const MaintenanceOverlay: React.FC<MaintenanceOverlayProps> = ({
  settings,
  user,
  onOpenAuth,
  onOpenContact,
  onDisableMaintenance
}) => {
  const isAdmin = user?.role === 'admin';

  // If maintenance mode is NOT active, do not render
  if (!settings.maintenanceMode) return null;

  // If user is Admin, render the top warning controller bar (Admin can continue working)
  if (isAdmin) {
    return (
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-slate-950 px-4 py-2.5 text-xs font-black shadow-xl sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-amber-400">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 stroke-[2.5] text-slate-950 animate-bounce" />
          <span>
            MAINTENANCE MODE IS CURRENTLY ACTIVE &mdash; Regular visitors are blocked from account checking. (Admin Bypass Active)
          </span>
        </div>

        <button
          type="button"
          onClick={onDisableMaintenance}
          className="px-3.5 py-1 rounded-xl bg-slate-950 text-amber-300 hover:text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
        >
          <Power className="w-3.5 h-3.5" />
          <span>Disable Maintenance Mode</span>
        </button>
      </div>
    );
  }

  // Regular Visitors / Non-Admins: Full-Screen Lockout Screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070b14] backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-[#0c1220] rounded-3xl border border-amber-500/40 shadow-2xl p-6 sm:p-8 space-y-6 text-center">
        
        {/* Animated Maintenance Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20">
          <Wrench className="w-8 h-8 stroke-[2.2] animate-pulse" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Scheduled System Upgrade
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            System Under Maintenance
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            {settings.maintenanceMessage ||
              'Hstock Account Checker is currently undergoing scheduled platform upgrades and security maintenance.'}
          </p>
        </div>

        {/* Data Safety Assurance Card */}
        <div className="p-4 rounded-2xl bg-[#080d18] border border-slate-800 text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>All User Funds &amp; Balances Are 100% Safe</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Your wallet balance, submitted Binance USDT deposits, and past verification records are fully preserved in encrypted storage. Verification engines will resume immediately upon maintenance completion.
          </p>
        </div>

        {/* Support & Admin Contact Strip */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenContact}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Contact Support (03131664235)</span>
          </button>

          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>Admin Operator Login</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 font-mono">
          Hstock Commercial Verification Platform &bull; Cloudflare WAF Protected
        </p>
      </div>
    </div>
  );
};
