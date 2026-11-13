import React, { useState, useMemo } from 'react';
import { AccountCheckResult } from '../types/status';
import { getCategoryFromStatus } from '../services/checkerApi';
import { PlatformBadgeIcon } from './PlatformIcons';
import {
  Copy,
  Check,
  Download,
  Ban,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface LiveBannedSeparatorCardProps {
  results: AccountCheckResult[];
  onFilterLiveOnly?: () => void;
  onFilterBannedOnly?: () => void;
}

export const LiveBannedSeparatorCard: React.FC<LiveBannedSeparatorCardProps> = ({
  results,
  onFilterLiveOnly,
  onFilterBannedOnly,
}) => {
  const [copyFormat, setCopyFormat] = useState<'withAt' | 'plain' | 'url'>('withAt');
  const [copiedType, setCopiedType] = useState<'live' | 'banned' | null>(null);

  // Extract LIVE accounts
  const liveAccounts = useMemo(() => {
    return results.filter((r) => getCategoryFromStatus(r.status) === 'LIVE');
  }, [results]);

  // Extract BANNED / SUSPENDED accounts
  const bannedAccounts = useMemo(() => {
    return results.filter((r) => getCategoryFromStatus(r.status) === 'SUSPENDED');
  }, [results]);

  // Format usernames based on selection (with @, plain, or full URL)
  const formatUsernames = (items: AccountCheckResult[]): string => {
    return items
      .map((item) => {
        if (copyFormat === 'url') return item.profileUrl;
        const clean = item.username.replace(/^@+/, '').trim();
        if (copyFormat === 'withAt') {
          return clean.startsWith('http') || clean.startsWith('Video:') || clean.startsWith('User ID:')
            ? clean
            : `@${clean}`;
        }
        return clean;
      })
      .join('\n');
  };

  const liveText = useMemo(() => formatUsernames(liveAccounts), [liveAccounts, copyFormat]);
  const bannedText = useMemo(() => formatUsernames(bannedAccounts), [bannedAccounts, copyFormat]);

  const handleCopy = async (text: string, type: 'live' | 'banned') => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const handleDownloadTxt = (text: string, filename: string) => {
    if (!text.trim()) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-heading">
              Separate Live &amp; Banned Usernames
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live accounts and confirmed banned accounts separated into individual lists
            </p>
          </div>
        </div>

        {/* Format Selector: With @, Plain, URL */}
        <div className="flex items-center space-x-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-lg text-xs self-start sm:self-auto font-medium">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 px-1 font-semibold">Format:</span>
          <button
            type="button"
            onClick={() => setCopyFormat('withAt')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              copyFormat === 'withAt'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            @username
          </button>
          <button
            type="button"
            onClick={() => setCopyFormat('plain')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              copyFormat === 'plain'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Plain
          </button>
          <button
            type="button"
            onClick={() => setCopyFormat('url')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              copyFormat === 'url'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Full URL
          </button>
        </div>
      </div>

      {/* Two-Column Side-by-Side Separation */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
        {/* =========================================
            LEFT COLUMN: 🟢 LIVE ACCOUNTS SEPARATE
            ========================================= */}
        <div className="p-4 sm:p-5 flex flex-col space-y-3 bg-emerald-50/20 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h4 className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-300 tracking-wide uppercase font-heading">
                Live Accounts ({liveAccounts.length})
              </h4>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Copy Live Usernames Button */}
              <button
                type="button"
                onClick={() => handleCopy(liveText, 'live')}
                disabled={liveAccounts.length === 0}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Copy all live usernames to clipboard"
              >
                {copiedType === 'live' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Live List</span>
                  </>
                )}
              </button>

              {/* Download Live Text File */}
              <button
                type="button"
                onClick={() => handleDownloadTxt(liveText, `live_accounts_${Date.now()}.txt`)}
                disabled={liveAccounts.length === 0}
                className="p-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700/60 bg-white dark:bg-slate-800 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-300 transition-colors disabled:opacity-40"
                title="Download live accounts as .txt file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Active and publicly verified accessible accounts. One username per line:
          </p>

          {/* Textarea containing only live usernames */}
          <div className="relative flex-1">
            <textarea
              readOnly
              rows={6}
              value={liveText || 'No LIVE accounts detected yet.'}
              className="w-full p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-950 font-mono text-xs text-emerald-900 dark:text-emerald-200 focus:outline-none resize-y selection:bg-emerald-200 dark:selection:bg-emerald-800"
            />
          </div>

          {/* Mini preview chips */}
          {liveAccounts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
              {liveAccounts.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/80"
                >
                  <PlatformBadgeIcon platform={item.platform} className="w-2.5 h-2.5 inline" />
                  <span>{item.username}</span>
                  <a
                    href={item.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-950 dark:hover:text-white"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* =========================================
            RIGHT COLUMN: 🔴 BANNED ACCOUNTS SEPARATE
            ========================================= */}
        <div className="p-4 sm:p-5 flex flex-col space-y-3 bg-rose-50/20 dark:bg-rose-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ban className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <h4 className="text-xs sm:text-sm font-black text-rose-800 dark:text-rose-300 tracking-wide uppercase font-heading">
                Banned / Suspended Accounts ({bannedAccounts.length})
              </h4>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Copy Banned Usernames Button */}
              <button
                type="button"
                onClick={() => handleCopy(bannedText, 'banned')}
                disabled={bannedAccounts.length === 0}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Copy all banned usernames to clipboard"
              >
                {copiedType === 'banned' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Banned List</span>
                  </>
                )}
              </button>

              {/* Download Banned Text File */}
              <button
                type="button"
                onClick={() => handleDownloadTxt(bannedText, `banned_accounts_${Date.now()}.txt`)}
                disabled={bannedAccounts.length === 0}
                className="p-1.5 rounded-lg border border-rose-300 dark:border-rose-700/60 bg-white dark:bg-slate-800 hover:bg-rose-50 text-rose-700 dark:text-rose-300 transition-colors disabled:opacity-40"
                title="Download banned accounts as .txt file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Confirmed terminated, suspended, or disabled accounts. One username per line:
          </p>

          {/* Textarea containing only banned usernames */}
          <div className="relative flex-1">
            <textarea
              readOnly
              rows={6}
              value={bannedText || 'No BANNED/SUSPENDED accounts detected.'}
              className="w-full p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-950 font-mono text-xs text-rose-900 dark:text-rose-200 focus:outline-none resize-y selection:bg-rose-200 dark:selection:bg-rose-800"
            />
          </div>

          {/* Mini preview chips */}
          {bannedAccounts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
              {bannedAccounts.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-100/70 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300/60 dark:border-rose-800/80"
                >
                  <PlatformBadgeIcon platform={item.platform} className="w-2.5 h-2.5 inline" />
                  <span>{item.username}</span>
                  <a
                    href={item.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-rose-950 dark:hover:text-white"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
