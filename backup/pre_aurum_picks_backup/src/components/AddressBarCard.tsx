import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  Edit3,
  Trash2,
  Share2,
  QrCode,
  Clock,
  PlusCircle,
  ExternalLink,
  Shield,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Inbox, DomainOption } from '../types/email';

interface AddressBarCardProps {
  inbox: Inbox | null;
  domains: { liveDomains: DomainOption[]; customDomains: DomainOption[] };
  isRefreshing: boolean;
  onRefresh: () => void;
  onChangeAddress: () => void;
  onDeleteInbox: () => void;
  onShareLink: () => void;
  onExtendExpiry: () => void;
  onSelectDomain: (domain: string) => void;
  onCopyAddress: () => void;
  onQuickSetUsername?: (username: string) => void;
  hasCopied: boolean;
}

export const AddressBarCard: React.FC<AddressBarCardProps> = ({
  inbox,
  domains,
  isRefreshing,
  onRefresh,
  onChangeAddress,
  onDeleteInbox,
  onShareLink,
  onExtendExpiry,
  onSelectDomain,
  onCopyAddress,
  onQuickSetUsername,
  hasCopied,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpiringSoon, setIsExpiringSoon] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [quickPrefix, setQuickPrefix] = useState<string>('');

  // Expiry countdown calculations
  useEffect(() => {
    if (!inbox?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const exp = new Date(inbox.expiresAt).getTime();
      const diffMs = exp - now;

      if (diffMs <= 0) {
        setTimeLeft('Expired');
        setIsExpiringSoon(true);
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      setIsExpiringSoon(totalSec < 300); // less than 5 min left

      if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m ${secs.toString().padStart(2, '0')}s`);
      } else {
        setTimeLeft(`${mins}m ${secs.toString().padStart(2, '0')}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [inbox?.expiresAt]);

  if (!inbox) {
    return (
      <div className="w-full bg-[#0d1326] border border-purple-900/40 rounded-2xl p-8 text-center animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded-lg mx-auto mb-4" />
        <div className="h-4 w-48 bg-slate-800/60 rounded mx-auto" />
      </div>
    );
  }

  // QR Code generator using standard SVG data uri / Google charts API safe image
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `mailto:${inbox.address}`
  )}&bgcolor=0e1428&color=c4b5fd`;

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1124] via-[#101730] to-[#181132] border border-purple-800/40 brand-glow p-5 sm:p-7 shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Shared Inbox Notification Banner if accessed via reference link */}
      {inbox.isSharedView && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-purple-900/40 border border-purple-500/40 flex items-center justify-between text-xs text-purple-200">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>
              <strong>Shared Reference View:</strong> You are viewing an active shared temporary inbox in real-time.
            </span>
          </div>
          <span className="text-[11px] font-mono text-purple-300">Read-Only Mode</span>
        </div>
      )}

      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-purple-900/30 text-xs">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">Your Temporary Email Address</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Real Inbound Ready
          </span>
        </div>

        {/* Expiry Countdown & Extend */}
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-medium ${
              isExpiringSoon
                ? 'bg-rose-950/40 border-rose-700/50 text-rose-300'
                : 'bg-purple-950/40 border-purple-700/40 text-purple-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}</span>
          </div>

          {!inbox.isSharedView && (
            <button
              onClick={onExtendExpiry}
              title="Add +15 minutes to inbox lifetime"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+15m</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Large Email Address Display */}
      <div className="py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-wider text-purple-400/80 mb-1">
              Active Disposable Address
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-mono break-all selection:bg-purple-500/30">
                {inbox.address}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400 inline" />
              Safe from spam. Messages arrive instantly and are wiped upon expiration.
            </p>
          </div>

          {/* Action Buttons: Copy, Refresh, Change, Delete, Share */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Copy Button */}
            <button
              onClick={onCopyAddress}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all transform active:scale-95 shadow-lg ${
                hasCopied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'brand-gradient-bg text-white hover:opacity-95 brand-glow'
              }`}
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  <span>Copy Address</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh inbox"
              className="flex items-center space-x-1.5 px-3.5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/70 text-sm font-medium transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* QR Code Toggle */}
            <button
              onClick={() => setShowQr(!showQr)}
              title="Show QR Code for mobile scanning"
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/70 transition-colors"
            >
              <QrCode className="w-4 h-4 text-purple-300" />
            </button>

            {/* Share Reference Link */}
            <button
              onClick={onShareLink}
              title="Share this inbox via a reference link"
              className="flex items-center space-x-1.5 px-3.5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/70 text-sm font-medium transition-colors"
            >
              <Share2 className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Change Address (Owner only) */}
            {!inbox.isSharedView && (
              <button
                onClick={onChangeAddress}
                title="Create custom or random new address"
                className="flex items-center space-x-1.5 px-3.5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/70 text-sm font-medium transition-all"
              >
                <Edit3 className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Change Address</span>
              </button>
            )}

            {/* Delete Address (Owner only) */}
            {!inbox.isSharedView && (
              <button
                onClick={onDeleteInbox}
                title="Delete this inbox permanently"
                className="flex items-center space-x-1.5 px-3.5 py-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-sm font-medium transition-all"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Delete Inbox</span>
              </button>
            )}
          </div>
        </div>

        {/* QR Code Dropdown Popover */}
        {showQr && (
          <div className="mt-4 p-4 rounded-xl bg-[#090d1a] border border-purple-800/50 flex flex-col sm:flex-row items-center gap-4 max-w-md mx-auto sm:mx-0">
            <img
              src={qrCodeUrl}
              alt="QR Code for temporary email"
              className="w-32 h-32 rounded-lg border border-purple-500/30 p-1 bg-[#0e1428]"
            />
            <div className="text-xs text-slate-300 space-y-1 text-center sm:text-left">
              <p className="font-semibold text-purple-300">Scan with Phone Camera</p>
              <p className="text-slate-400">
                Instantly fill this temporary email on your smartphone or mobile registration form.
              </p>
              <p className="font-mono text-[11px] text-purple-400 pt-1 break-all">{inbox.address}</p>
            </div>
          </div>
        )}

        {/* Quick Custom Username Bar (e.g. for sonia5727 or custom names) */}
        {!inbox.isSharedView && onQuickSetUsername && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (quickPrefix.trim()) {
                onQuickSetUsername(quickPrefix.trim());
                setQuickPrefix('');
              }
            }}
            className="mt-4 p-2 sm:p-2.5 rounded-xl bg-[#090d1c] border border-purple-900/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="flex-1 flex items-center space-x-2 px-2 text-xs text-slate-300">
              <span className="text-purple-400 font-semibold whitespace-nowrap">Custom Name:</span>
              <input
                type="text"
                placeholder="e.g. sonia5727 or my.project"
                value={quickPrefix}
                onChange={(e) => setQuickPrefix(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-purple-500"
              />
              <span className="text-slate-500 font-mono text-xs hidden sm:inline">@{inbox.domain}</span>
            </div>
            <button
              type="submit"
              disabled={!quickPrefix.trim()}
              className="px-3.5 py-1.5 rounded-lg brand-gradient-bg text-white font-semibold text-xs hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
            >
              Set Custom Address
            </button>
          </form>
        )}
      </div>

      {/* Domain Switcher Quick Pills */}
      <div className="pt-4 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium">Switch Domain:</span>
          {domains.liveDomains.slice(0, 4).map((d) => (
            <button
              key={d.domain}
              onClick={() => onSelectDomain(d.domain)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                inbox.domain.toLowerCase() === d.domain.toLowerCase()
                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              @{d.domain}
            </button>
          ))}
          {domains.customDomains.slice(0, 1).map((d) => (
            <button
              key={d.domain}
              onClick={() => onSelectDomain(d.domain)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                inbox.domain.toLowerCase() === d.domain.toLowerCase()
                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-purple-300 border border-purple-900/50'
              }`}
            >
              @{d.domain}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Real-time delivery &bull; Military-grade HTML Sanitization</span>
        </div>
      </div>
    </div>
  );
};
