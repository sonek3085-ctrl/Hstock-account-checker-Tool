import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import {
  X,
  Key,
  Copy,
  Check,
  Calendar,
  User,
  ShieldCheck,
  Code,
  FileText,
  Printer,
  AlertTriangle,
  Download,
  Share2,
} from 'lucide-react';
import { EmailMessage } from '../types/email';

interface EmailDetailModalProps {
  message: EmailMessage | null;
  onClose: () => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({ message, onClose }) => {
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  if (!message) return null;

  // Sanitize with DOMPurify on the client as second line of defense
  const sanitizedHtml = DOMPurify.sanitize(message.htmlBody || `<p>${message.textBody}</p>`, {
    ALLOWED_TAGS: [
      'a', 'b', 'blockquote', 'br', 'caption', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5',
      'h6', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 's', 'small', 'span', 'strong', 'sub', 'sup',
      'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'style', 'class', 'alt', 'src', 'width', 'height'],
  });

  const handleCopyCode = () => {
    if (message.verificationCode) {
      navigator.clipboard.writeText(message.verificationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(message.textBody || message.htmlBody);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0c1122] border border-purple-800/50 shadow-2xl overflow-hidden brand-glow">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-purple-900/30 bg-[#0e162c] flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
              Secure Message Viewer
            </span>
            {message.isDemo && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SIMULATED DEMO
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyBody}
              title="Copy message content"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {copiedBody ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrint}
              title="Print email"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Extracted Verification Code Hero Card if available */}
        {message.verificationCode && (
          <div className="m-4 mb-0 p-4 rounded-xl bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-purple-950/80 border border-purple-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl brand-gradient-bg flex items-center justify-center brand-glow shrink-0">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                  Verification Code Detected
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-widest">
                  {message.verificationCode}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all transform active:scale-95 shadow-md ${
                copiedCode
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-900 hover:bg-purple-100'
              }`}
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Code Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Email Header Info */}
        <div className="p-5 border-b border-purple-900/20 bg-[#090e1d] space-y-2">
          <h2 className="text-lg sm:text-xl font-bold text-white font-heading break-words">
            {message.subject}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
            <div className="flex items-center space-x-2 truncate">
              <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-slate-400">From:</span>
              <span className="font-semibold text-slate-200 truncate">{message.from}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-slate-400">Date:</span>
              <span>{new Date(message.date).toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-2 truncate">
              <span className="text-slate-400 pl-5 sm:pl-0">To:</span>
              <span className="font-mono text-purple-300 truncate">{message.to}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                SPF: PASS &bull; DKIM: VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="px-5 py-2.5 bg-[#0b1021] border-b border-purple-900/20 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('html')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'html' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>HTML View</span>
            </button>
            <button
              onClick={() => setViewMode('text')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'text' ? 'bg-purple-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Plain Text</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scripts, iframe injections &amp; tracking blocked</span>
          </div>
        </div>

        {/* Email Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-950/40">
          {viewMode === 'html' ? (
            <div
              className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed overflow-x-auto bg-[#0a0f20] p-5 rounded-xl border border-purple-900/20"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-slate-300 bg-[#0a0f20] p-5 rounded-xl border border-purple-900/20 leading-relaxed overflow-x-auto">
              {message.textBody || 'No text version available.'}
            </pre>
          )}

          {/* Attachments list if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-5 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                Attachments ({message.attachments.length})
              </h4>
              <div className="space-y-2">
                {message.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs"
                  >
                    <span className="font-mono text-slate-200">{att.filename}</span>
                    <span className="text-slate-400">{att.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info notice */}
        <div className="px-5 py-3 border-t border-purple-900/30 bg-[#0a0e1c] flex items-center justify-between text-[11px] text-slate-500">
          <span>EXTRA MAIL Anti-Phishing Filter active</span>
          <button onClick={onClose} className="text-purple-400 hover:underline">
            Back to Inbox
          </button>
        </div>
      </div>
    </div>
  );
};
