import React from 'react';
import { Mail, RefreshCw, Share2, BookOpen, ShieldCheck, Sparkles, Radio } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenGuide: () => void;
  onOpenShare: () => void;
  onSendTest: () => void;
  isSendingTest: boolean;
  hasInbox: boolean;
  autoRefreshCountdown: number;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  onOpenGuide,
  onOpenShare,
  onSendTest,
  isSendingTest,
  hasInbox,
  autoRefreshCountdown,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-purple-900/30 bg-[#0a0e1c]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl brand-gradient-bg flex items-center justify-center brand-glow">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-heading">
                EXTRA<span className="text-purple-400">MAIL</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Premium Disposable &amp; Temporary Email System
            </p>
          </div>
        </div>

        {/* Status & Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Live Sync Status Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Auto-refresh:</span>
            <span className="font-mono text-purple-400 font-semibold">{autoRefreshCountdown}s</span>
          </div>

          {/* Send Test Email Button */}
          {hasInbox && (
            <button
              onClick={onSendTest}
              disabled={isSendingTest}
              title="Simulate receiving an authentication OTP code"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-700/50 transition-colors shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Send Test OTP</span>
            </button>
          )}

          {/* Share Reference Link */}
          {hasInbox && (
            <button
              onClick={onOpenShare}
              title="Share this temporary inbox with another device or collaborator"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Share Link</span>
            </button>
          )}

          {/* Infrastructure Setup Guide */}
          <button
            onClick={onOpenGuide}
            title="Domain, MX records, and Webhook deployment documentation"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">Email Docs &amp; MX</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh inbox now"
            className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
