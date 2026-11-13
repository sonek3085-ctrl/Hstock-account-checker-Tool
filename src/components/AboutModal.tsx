import React from 'react';
import { X, Sparkles, ShieldCheck, HeartHandshake, Award, Target, CheckCircle2 } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
  onOpenContact: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose, onOpenContact }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#101625] rounded-3xl border border-amber-500/30 shadow-2xl shadow-black overflow-hidden my-8 p-6 sm:p-8"
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
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                <span className="font-brand font-black text-amber-400 text-lg">AP</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">
                About <span className="gold-text-gradient">AURUM PICKS</span>
              </h2>
              <p className="text-xs text-amber-400 tracking-wider uppercase font-medium">
                Discover Better. Shop Smarter.
              </p>
            </div>
          </div>

          <div className="text-sm text-slate-300 space-y-4 leading-relaxed border-t border-slate-800 pt-5">
            <p>
              Welcome to <strong>AURUM PICKS</strong>, Pakistan’s premier curated affiliate shopping and product discovery destination. We exist to solve one fundamental problem faced by Pakistani online shoppers: navigating through hundreds of unreliable listings, fluctuating prices, and unverified sellers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <Award className="w-4 h-4" />
                  <span>Our Mission</span>
                </div>
                <p className="text-xs text-slate-400">
                  To hand-pick only high-performing, authentic, and genuinely discounted products across tech, apparel, luxury accessories, and home appliances.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F19] border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero Price Markups</span>
                </div>
                <p className="text-xs text-slate-400">
                  Shoppers pay exactly the seller’s discounted price. We never charge additional membership or transaction fees.
                </p>
              </div>
            </div>

            <h3 className="text-base font-bold text-white pt-2">How AURUM PICKS Operates:</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Editorial Vetting:</strong> Every single item listed in our catalog is hand-screened by our curation team for high seller ratings and positive consumer feedback.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Direct Checkout:</strong> When you find a product you love and click <em>Buy Now</em>, you are securely redirected to the original vendor's website (such as Daraz.pk) to complete your order.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Transparent Affiliation:</strong> As an affiliate partner, we may receive a modest commission from the seller when you make a qualifying purchase, which keeps our platform free for Pakistani shoppers.</span>
              </li>
            </ul>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              💡 Have a question or want to recommend a product to be featured on AURUM PICKS? Feel free to reach out to our team anytime.
            </div>
          </div>

          {/* Footer CTA */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => { onClose(); onOpenContact(); }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Contact Support
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
