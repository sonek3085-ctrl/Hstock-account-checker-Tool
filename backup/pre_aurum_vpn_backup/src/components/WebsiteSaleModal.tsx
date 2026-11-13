import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Mail, ShieldCheck, ArrowRight, Share2, Copy, Check } from 'lucide-react';

interface WebsiteSaleModalProps {
  onClose: () => void;
  contactEmail?: string;
}

export const WebsiteSaleModal: React.FC<WebsiteSaleModalProps> = ({
  onClose,
  contactEmail = 'usmanalikhanchandio@gmail.com'
}) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#101625] rounded-3xl border border-amber-500/40 shadow-2xl shadow-black overflow-hidden my-8 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#0B0F19] text-slate-400 hover:text-white transition-colors border border-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center text-amber-400 font-bold text-lg">
                💼
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Turnkey Digital Asset For Sale</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">
                Acquire <span className="gold-text-gradient">AURUM PICKS</span>
              </h2>
            </div>
          </div>

          <div className="text-sm text-slate-300 space-y-4 leading-relaxed border-t border-slate-800 pt-5">
            <p className="text-xs sm:text-sm text-slate-200">
              This complete, fully-coded Pakistani affiliate e-commerce platform is available for acquisition. Designed specifically for monetizing Daraz affiliate partnerships, Amazon Associates, and local e-commerce deals.
            </p>

            {/* Asset Value Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-amber-500/20 space-y-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Full Source Code Included
                </span>
                <p className="text-[11px] text-slate-400">
                  Modern React 19, TypeScript, Tailwind CSS, Express backend with complete ownership.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-amber-500/20 space-y-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Password-Protected Admin Panel
                </span>
                <p className="text-[11px] text-slate-400">
                  Easy product upload, image management, PKR pricing, live visitor tracking, and click analytics.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-amber-500/20 space-y-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  100% Mobile-First Responsive
                </span>
                <p className="text-[11px] text-slate-400">
                  Flawless performance in Chrome on Android, iPhone, tablets, and desktop computers.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-amber-500/20 space-y-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Zero Inventory / Zero Hassle
                </span>
                <p className="text-[11px] text-slate-400">
                  Earn pure affiliate commissions directly from Daraz & merchants without buying stock or shipping packages.
                </p>
              </div>
            </div>

            {/* Direct Contact Action Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#101625] border border-amber-500/30 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Direct Contact with Seller / Owner</span>
                </h3>
                <p className="text-xs text-slate-400">Direct response via verified official email</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:${contactEmail}?subject=AURUM%20PICKS%20Website%20Acquisition%20Inquiry`}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-slate-950" />
                  <span>Email Seller Directly ({contactEmail})</span>
                </a>
              </div>
            </div>

            {/* Demo Link Copy Box */}
            <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold block">
                Shareable Demo Link for Buyers:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-[#121826] text-xs text-amber-400 px-3 py-2 rounded-lg border border-slate-700 font-mono truncate select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
