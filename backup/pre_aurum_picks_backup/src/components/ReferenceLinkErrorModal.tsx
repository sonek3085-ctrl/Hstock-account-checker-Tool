import React from 'react';
import { AlertCircle, Clock, ShieldX, Sparkles, RefreshCw, HelpCircle, ArrowRight } from 'lucide-react';

interface ReferenceLinkErrorModalProps {
  reason?: 'EXPIRED' | 'NOT_FOUND' | 'INVALID_TOKEN' | 'DELETED' | string;
  errorMessage: string;
  attemptedAddress?: string;
  onCreateNewInbox: () => void;
  onClose: () => void;
}

export const ReferenceLinkErrorModal: React.FC<ReferenceLinkErrorModalProps> = ({
  reason,
  errorMessage,
  attemptedAddress,
  onCreateNewInbox,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0d1226] border border-rose-500/40 shadow-2xl overflow-hidden brand-glow">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-rose-950/40 bg-[#120f24] flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            {reason === 'EXPIRED' ? (
              <Clock className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldX className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-heading">
              {reason === 'EXPIRED' ? 'Reference Link Has Expired' : 'Unable to Access Reference Link'}
            </h3>
            <p className="text-xs text-rose-300/80">
              {reason === 'EXPIRED' ? 'Scheduled temporary retention limit reached' : 'Security validation failure'}
            </p>
          </div>
        </div>

        {/* Modal Explanation Body */}
        <div className="p-6 space-y-4">
          {attemptedAddress && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <span className="text-slate-400">Target Address: </span>
              <span className="font-mono text-purple-300 font-semibold break-all">{attemptedAddress}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p className="font-semibold text-rose-200">Why did this happen?</p>
            <p>{errorMessage}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>How Temporary Email Inboxes Work:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[12px]">
              <li>
                <strong>Ephemeral Lifespan:</strong> EXTRA MAIL addresses expire automatically after their timer (e.g.
                60 minutes) to prevent unauthorized permanent storage and spam.
              </li>
              <li>
                <strong>Security Tokens:</strong> Reference links require an intact cryptographic token (`&amp;ref=...`)
                in the URL. If the URL was modified or partially copied, access is denied.
              </li>
              <li>
                <strong>Owner Rotation:</strong> If the person who created the link clicked "Change Address" or "Delete
                Inbox", old reference links are decommissioned immediately.
              </li>
            </ul>
          </div>

          {/* Call to action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onCreateNewInbox}
              className="w-full sm:flex-1 flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs brand-gradient-bg text-white hover:opacity-95 brand-glow transition-all active:scale-95 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Your Own Free Inbox Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
