import React from 'react';
import { AccountStatus } from '../types/status';
import { XCircle, HelpCircle, Ban, Lock, Radio } from 'lucide-react';

interface StatusBadgeProps {
  status: AccountStatus;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showIcon = true }) => {
  switch (status) {
    case 'LIVE':
    case 'AVAILABLE':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-black tracking-wide bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 dark:border-emerald-500/50 shadow-sm ${className}`}
        >
          {showIcon && (
            <span className="relative flex h-2 w-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
          <span>LIVE</span>
        </span>
      );

    case 'SUSPENDED':
    case 'BANNED':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40 dark:border-rose-500/50 shadow-sm ${className}`}
        >
          {showIcon && <Ban className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />}
          <span>SUSPENDED</span>
        </span>
      );

    case 'NOT_FOUND':
    case 'UNAVAILABLE':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800/60 ${className}`}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0" />}
          <span>NOT FOUND</span>
        </span>
      );

    case 'PRIVATE':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/40 dark:border-blue-500/50 shadow-sm ${className}`}
        >
          {showIcon && <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
          <span>PRIVATE</span>
        </span>
      );

    case 'UNVERIFIED':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/40 dark:border-amber-500/50 shadow-sm ${className}`}
        >
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
          <span>UNVERIFIED</span>
        </span>
      );

    case 'UNKNOWN':
    case 'ERROR':
    default:
      return (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/40 dark:border-amber-500/50 shadow-sm ${className}`}
        >
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
          <span>UNKNOWN</span>
        </span>
      );
  }
};
