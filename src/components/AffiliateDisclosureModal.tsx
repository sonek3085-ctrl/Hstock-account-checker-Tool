import React from 'react';
import { X, ShieldAlert, Sparkles, CheckCircle2, DollarSign } from 'lucide-react';

interface AffiliateDisclosureModalProps {
  onClose: () => void;
}

export const AffiliateDisclosureModal: React.FC<AffiliateDisclosureModalProps> = ({ onClose }) => {
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
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">
                Affiliate <span className="gold-text-gradient">Disclosure</span>
              </h2>
              <p className="text-xs text-amber-400/90 tracking-wider uppercase font-medium">
                Transparency & Full Consumer Protection
              </p>
            </div>
          </div>

          <div className="text-sm text-slate-300 space-y-4 leading-relaxed border-t border-slate-800 pt-5">
            <p>
              In compliance with global e-commerce transparency guidelines and the FTC regulations for affiliate marketing, we believe in full honesty with our visitors.
            </p>

            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-amber-500/20 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>What Is an Affiliate Link?</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Some of the links on <strong>AURUM PICKS</strong> are affiliate links (including the <em>Buy Now</em> buttons linking to Daraz.pk, Amazon, and other official merchant websites). This means that if you click on the link and purchase the item from the merchant, we may receive an affiliate referral commission from the seller.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">Guarantees to You as a Shopper:</h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Cost to You:</strong> You never pay a single rupee extra. The price you pay on the seller's website is identical to (or discounted from) going directly to the merchant.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>No Biased Listings:</strong> We only curate products that represent real value, solid build quality, and verified customer satisfaction. Commission rates do not dictate our editorial selection.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Secure Transactions:</strong> AURUM PICKS does not take your credit card, debit card, or payment details. You complete your transaction directly on trusted e-commerce stores with their own customer support and return guarantees.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-slate-400 pt-2">
              If you have any questions regarding our affiliate relationships, please reach out through our Contact page or WhatsApp support.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
