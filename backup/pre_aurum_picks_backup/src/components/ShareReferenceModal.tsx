import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  ShieldAlert,
  Send,
  MessageCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Inbox } from '../types/email';

interface ShareReferenceModalProps {
  inbox: Inbox;
  onClose: () => void;
}

export const ShareReferenceModal: React.FC<ShareReferenceModalProps> = ({ inbox, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Generate reference link URL with address and shareToken
  const origin = window.location.origin;
  const shareUrl = `${origin}/?inbox=${encodeURIComponent(inbox.address)}&ref=${encodeURIComponent(
    inbox.shareToken
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Here is my secure temporary inbox on EXTRA MAIL: ${inbox.address}. You can view incoming verification codes and emails in real-time here: ${shareUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
    `EXTRA MAIL Temporary Inbox: ${inbox.address}`
  )}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    shareUrl
  )}&bgcolor=0e1428&color=c4b5fd`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0c1124] border border-purple-800/60 shadow-2xl overflow-hidden brand-glow">
        {/* Header */}
        <div className="px-5 py-4 border-b border-purple-900/30 bg-[#0e162d] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg brand-gradient-bg text-white">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-heading">
              Share Reference Link
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-300">
            Send this reference link to another device, partner, or colleague so they can view incoming emails and OTP
            verification codes in real-time.
          </p>

          {/* Reference URL Box */}
          <div className="p-3.5 rounded-xl bg-[#080d1c] border border-purple-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
              <span>Your Unique Reference Link:</span>
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Active until inbox expires
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-purple-200 select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'brand-gradient-bg text-white hover:opacity-90 shadow-md'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 text-xs font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </a>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px] flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-700/50 text-xs font-medium transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Share Telegram</span>
            </a>

            <button
              onClick={() => setShowQr(!showQr)}
              className="flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <QrCode className="w-4 h-4 text-purple-300" />
              <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
            </button>
          </div>

          {/* QR Code view */}
          {showQr && (
            <div className="p-4 rounded-xl bg-[#090d1a] border border-purple-800/40 text-center flex flex-col items-center">
              <img
                src={qrUrl}
                alt="QR Code for reference link"
                className="w-40 h-40 rounded-lg p-2 bg-[#0e1428] border border-purple-500/30"
              />
              <p className="text-xs text-slate-400 mt-2">
                Scan with any smartphone camera to open the reference link directly.
              </p>
            </div>
          )}

          {/* Security & Expiry Notice */}
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-purple-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>How Reference Links Work:</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-400">
              <li>
                <strong>Read-Only Access:</strong> Recipients can view incoming emails and copy codes, but cannot delete
                or change your address.
              </li>
              <li>
                <strong>Automatic Cleanup:</strong> When your inbox timer reaches zero, this link automatically expires
                and ceases to provide access.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-purple-900/30 bg-[#0a0e1c] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
