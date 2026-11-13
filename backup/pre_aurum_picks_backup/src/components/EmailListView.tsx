import React, { useState } from 'react';
import {
  Mail,
  Search,
  Key,
  Copy,
  Check,
  ChevronRight,
  Inbox as InboxIcon,
  Sparkles,
  Paperclip,
  Clock,
  Radio,
} from 'lucide-react';
import { EmailMessage } from '../types/email';

interface EmailListViewProps {
  messages: EmailMessage[];
  selectedMessage: EmailMessage | null;
  onSelectMessage: (msg: EmailMessage) => void;
  onSendTest: () => void;
  isSendingTest: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  autoRefreshCountdown: number;
}

export const EmailListView: React.FC<EmailListViewProps> = ({
  messages,
  selectedMessage,
  onSelectMessage,
  onSendTest,
  isSendingTest,
  onRefresh,
  isRefreshing,
  autoRefreshCountdown,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Filter messages based on search
  const filtered = messages.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.subject.toLowerCase().includes(term) ||
      m.from.toLowerCase().includes(term) ||
      (m.verificationCode && m.verificationCode.toLowerCase().includes(term))
    );
  });

  const handleCopyCode = (e: React.MouseEvent, code: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="bg-[#0b1021] border border-purple-900/40 rounded-2xl overflow-hidden shadow-xl">
      {/* List Header & Search */}
      <div className="p-4 sm:p-5 border-b border-purple-900/30 bg-[#0d142a]/90 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <span>Inbox Messages</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-purple-600/30 text-purple-300 font-mono">
                {messages.length}
              </span>
            </h2>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search sender, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Auto-refresh subtle progress indicator bar */}
      <div className="h-0.5 bg-slate-800 w-full overflow-hidden">
        <div
          className="h-full bg-purple-500 transition-all duration-1000 ease-linear"
          style={{ width: `${((5 - autoRefreshCountdown) / 5) * 100}%` }}
        />
      </div>

      {/* Messages List Body */}
      {filtered.length === 0 ? (
        // Empty State with radar animation
        <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-purple-900/20 border border-purple-700/30 flex items-center justify-center text-purple-400 brand-glow">
              <InboxIcon className="w-9 h-9" />
            </div>
            {/* Pulsing radar ring */}
            <span className="animate-ping absolute inset-0 rounded-full bg-purple-500/20" />
          </div>

          <h3 className="text-lg font-bold text-white font-heading">Your inbox is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">
            Waiting for incoming messages. Any email sent to your disposable address will show up here automatically
            within 5 seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onSendTest}
              disabled={isSendingTest}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold brand-gradient-bg text-white hover:opacity-95 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSendingTest ? 'Sending Demo OTP...' : 'Send Demo OTP Message'}</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Refresh Now</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-purple-900/20">
          {/* Desktop Table Headers */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2.5 bg-[#0a0e1e] text-[11px] font-bold uppercase tracking-wider text-purple-300/80 border-b border-purple-900/30">
            <div className="col-span-4">Sender</div>
            <div className="col-span-5">Subject &amp; OTP Code</div>
            <div className="col-span-2 text-right">Date / Time</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {filtered.map((msg) => {
            const isSelected = selectedMessage?.id === msg.id;

            return (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg)}
                className={`p-4 sm:p-5 transition-all cursor-pointer hover:bg-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isSelected ? 'bg-purple-900/30 border-l-4 border-l-purple-500' : ''
                }`}
              >
                {/* Left: Sender & Subject */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm text-slate-100 truncate max-w-xs">
                      {msg.fromName || msg.from}
                    </span>

                    {/* Verification Code pill if detected */}
                    {msg.verificationCode && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-[11px] font-mono font-bold text-purple-300">
                        <Key className="w-3 h-3 text-purple-400" />
                        <span>OTP: {msg.verificationCode}</span>
                        <button
                          onClick={(e) => handleCopyCode(e, msg.verificationCode!, msg.id)}
                          title="Copy verification code"
                          className="ml-1 hover:text-white"
                        >
                          {copiedCodeId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-purple-300" />
                          )}
                        </button>
                      </span>
                    )}

                    {/* Demo label if test message */}
                    {msg.isDemo && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        DEMO DATA
                      </span>
                    )}
                  </div>

                  {/* Subject */}
                  <h4 className="text-sm font-medium text-slate-200 truncate">{msg.subject}</h4>

                  {/* Text preview */}
                  <p className="text-xs text-slate-400 truncate mt-0.5">{msg.textBody || 'View email contents...'}</p>
                </div>

                {/* Right: Date, attachments & View CTA */}
                <div className="flex items-center justify-between md:justify-end space-x-3 text-xs text-slate-400 shrink-0">
                  {msg.attachments && msg.attachments.length > 0 && (
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{msg.attachments.length}</span>
                    </span>
                  )}

                  <div className="flex items-center space-x-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{formatDate(msg.date)}</span>
                  </div>

                  <button className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-purple-600 hover:text-white text-slate-300 text-xs transition-colors">
                    <span>View</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
