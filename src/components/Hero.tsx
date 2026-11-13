import React from 'react';
import { Sparkles, ShieldCheck, ShoppingBag, ArrowRight, Zap, CheckCircle2, Share2 } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onOpenAdmin?: () => void;
  onOpenShareModal?: () => void;
  isCustomerMode?: boolean;
  productsCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  onOpenAdmin,
  onOpenShareModal,
  isCustomerMode = false,
  productsCount
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-[#0B0F19] via-[#0E1424] to-[#0B0F19] border-b border-amber-500/20">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-amber-600/5 blur-[90px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>PAKISTAN'S PREMIER AFFILIATE DISCOVERY PLATFORM</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Discover Better. <br />
            <span className="gold-text-gradient font-serif italic">Shop Smarter.</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            AURUM PICKS brings you hand-curated selections of trending gadgets, fashion, home essentials, and lifestyle products from verified Pakistani stores like <span className="text-amber-400 font-semibold">Daraz.pk</span> and global leaders — at genuine discounted prices.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onExploreClick}
              className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-300 active:scale-95 text-sm sm:text-base cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-slate-950" />
              <span>Explore Deals ({productsCount})</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            {!isCustomerMode && onOpenAdmin ? (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-2 bg-[#121826] hover:bg-[#1A2234] text-slate-200 hover:text-amber-300 font-medium px-5 py-3.5 rounded-xl border border-amber-500/30 hover:border-amber-400 transition-all duration-200 text-sm sm:text-base cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Management</span>
              </button>
            ) : onOpenShareModal ? (
              <button
                onClick={onOpenShareModal}
                className="flex items-center gap-2 bg-[#121826] hover:bg-[#1A2234] text-amber-300 font-medium px-5 py-3.5 rounded-xl border border-amber-500/40 hover:border-amber-400 transition-all duration-200 text-sm sm:text-base cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Share Store Link</span>
              </button>
            ) : null}
          </div>

          {/* Trust Value Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5 justify-center p-3 rounded-lg bg-[#121826]/60 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">100% Genuine</p>
                <p className="text-[11px] text-slate-400">Verified Sellers</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 justify-center p-3 rounded-lg bg-[#121826]/60 border border-slate-800">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Direct Buy</p>
                <p className="text-[11px] text-slate-400">Original Store Link</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 justify-center p-3 rounded-lg bg-[#121826]/60 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Zero Extra Fees</p>
                <p className="text-[11px] text-slate-400">Direct Discounts</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 justify-center p-3 rounded-lg bg-[#121826]/60 border border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Curated Daily</p>
                <p className="text-[11px] text-slate-400">Pakistani Deals</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
