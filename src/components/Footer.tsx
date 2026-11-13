import React from 'react';
import { Shield, Sparkles, Heart, Mail, FileText, Lock, ExternalLink, Share2 } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
  onOpenContact: () => void;
  onOpenDisclosure: () => void;
  onOpenPrivacy: () => void;
  onOpenAdmin: () => void;
  onOpenSaleModal?: () => void;
  onOpenShareModal?: () => void;
  isCustomerMode?: boolean;
  onSelectCategory: (cat: string) => void;
  categories: string[];
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAbout,
  onOpenContact,
  onOpenDisclosure,
  onOpenPrivacy,
  onOpenAdmin,
  onOpenSaleModal,
  onOpenShareModal,
  isCustomerMode = false,
  onSelectCategory,
  categories
}) => {
  return (
    <footer className="bg-[#080B12] border-t border-amber-500/20 text-slate-400 text-xs mt-20">
      
      {/* Top Affiliate Disclosure Strip */}
      <div className="bg-[#0D121F] border-b border-amber-500/10 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-amber-400/90 text-xs">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span><strong>Transparent Affiliate Disclosure:</strong> We hand-curate genuine Pakistani deals and earn a small commission when you buy through our links — with 0% extra cost to you.</span>
          </div>
          <button
            onClick={onOpenDisclosure}
            className="text-amber-400 hover:text-amber-300 underline font-semibold text-xs shrink-0 cursor-pointer"
          >
            Read Full Disclosure
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md">
                <div className="w-full h-full bg-[#0B0F19] rounded-[9px] flex items-center justify-center">
                  <span className="font-brand font-black text-amber-400 text-base">AP</span>
                </div>
              </div>
              <div>
                <span className="font-brand font-bold text-lg text-white tracking-wider block">
                  AURUM <span className="text-amber-400">PICKS</span>
                </span>
                <span className="text-[10px] text-amber-400/90 tracking-widest uppercase font-semibold">
                  Discover Better. Shop Smarter.
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Pakistan's premium affiliate discovery platform. We bring you hand-picked, authentic discounts from verified sellers on Daraz.pk and global brands.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5 text-slate-300">
              <a
                href="https://www.facebook.com/share/1ChLWZSUkD/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] border border-[#1877F2]/30 transition-all text-xs font-semibold hover:scale-105 active:scale-95"
                title="Follow AURUM PICKS on Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </a>
              <a
                href="mailto:usmanalikhanchandio@gmail.com"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121826] hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors text-xs font-semibold"
                title="Official Support Email"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Email</span>
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs font-serif">
              Curated Categories
            </h4>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company & Trust */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs font-serif">
              Information & Trust
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onOpenAbout} className="hover:text-amber-400 transition-colors cursor-pointer">
                  About AURUM PICKS
                </button>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Contact Us & Support
                </button>
              </li>
              <li>
                <button onClick={onOpenDisclosure} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Affiliate Disclosure
                </button>
              </li>
              <li>
                <button onClick={onOpenPrivacy} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              {!isCustomerMode && onOpenSaleModal && (
                <li>
                  <button onClick={onOpenSaleModal} className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1">
                    <span>💼</span>
                    <span>Website For Sale (Acquire Business)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Store Owner Portal OR Customer Share */}
          {!isCustomerMode ? (
            <div className="space-y-3 p-5 rounded-2xl bg-[#0D121F] border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>Store Owner Area</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Manage your product catalog, upload new product images, set prices in PKR, and monitor real-time affiliate clicks.
              </p>
              <button
                onClick={onOpenAdmin}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-slate-950" />
                <span>Admin Management</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 p-5 rounded-2xl bg-[#0D121F] border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Share With Friends</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Enjoy browsing our curated Pakistani deals. Share this catalog with your friends and family so they can discover smart deals too.
              </p>
              {onOpenShareModal && (
                <button
                  onClick={onOpenShareModal}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-950" />
                  <span>Share Store Link</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} AURUM PICKS. All rights reserved. Built for Pakistani online shoppers.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onOpenPrivacy} className="hover:text-slate-300">Privacy Policy</button>
            <span>&bull;</span>
            <button onClick={onOpenDisclosure} className="hover:text-slate-300">Affiliate Terms</button>
            <span>&bull;</span>
            <button onClick={onOpenContact} className="hover:text-slate-300">Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
