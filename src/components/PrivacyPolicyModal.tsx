import React from 'react';
import { X, ShieldCheck, Lock, Eye, Database } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#101625] rounded-3xl border border-amber-500/30 shadow-2xl shadow-black overflow-hidden my-8 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#0B0F19] text-slate-400 hover:text-white transition-colors border border-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">
                Privacy <span className="gold-text-gradient">Policy</span>
              </h2>
              <p className="text-xs text-amber-400/90 tracking-wider uppercase font-medium">
                Your Data & Protection Standards
              </p>
            </div>
          </div>

          <div className="text-sm text-slate-300 space-y-4 leading-relaxed border-t border-slate-800 pt-5 max-h-[60vh] overflow-y-auto pr-2">
            <p>
              At <strong>AURUM PICKS</strong>, we respect your privacy and are committed to protecting any information collected during your visit to our website.
            </p>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span>1. Information We Collect</span>
              </h3>
              <p className="text-xs text-slate-400">
                - <strong>Usage & Analytics Data:</strong> We collect aggregate, anonymized metrics (such as page views, visitor count, and affiliate click timestamps) to measure store performance and popular deals.<br />
                - <strong>Inquiry Information:</strong> If you contact us via our Contact form or WhatsApp, we collect your name, email, phone number, and message exclusively to respond to your inquiry.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>2. Third-Party Affiliate Links & Cookies</span>
              </h3>
              <p className="text-xs text-slate-400">
                When you click a <em>Buy Now</em> link, you are redirected to third-party merchant platforms (e.g., Daraz.pk, Amazon). These platforms use session cookies to verify that a referral originated from AURUM PICKS. Their respective privacy policies govern the processing of your order and payment details.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>3. No Sale of Personal Information</span>
              </h3>
              <p className="text-xs text-slate-400">
                We never sell, rent, or trade your personal information or contact details to third-party marketing brokers or advertisers.
              </p>
            </div>

            <p className="text-xs text-slate-500 pt-2">
              Last updated: 2026. For inquiries regarding data handling or privacy requests, contact us at usmanalikhanchandio@gmail.com.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Close Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
