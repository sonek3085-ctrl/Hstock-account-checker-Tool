import React from 'react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExploreClick: () => void;
  totalProducts: number;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  onExploreClick,
  totalProducts,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#07080b] py-12 sm:py-20 border-b border-amber-500/20">
      {/* Golden Ambient Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Luxury Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
          <span className="text-amber-400 text-xs">✨</span>
          <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
            AURUM DIGITAL — Dynamic Store
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Premium Digital Assets &{' '}
          <span className="gold-gradient-text drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]">
            Products Store
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Explore our catalog of digital products with fast delivery directly to your WhatsApp.
          Orders routed dynamically to WhatsApp: <strong className="text-amber-300 font-mono">03131664235</strong>.
        </p>

        {/* Hero Search Bar */}
        <div className="mt-8 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products by title, category, or features..."
              className="w-full px-5 py-3.5 sm:py-4 pl-12 rounded-2xl bg-[#0f1016] border border-amber-500/30 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 shadow-xl shadow-black/60 transition-all"
            />
            <svg
              className="w-5 h-5 text-amber-400 absolute left-4 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#1a1b24] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onExploreClick}
            className="px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/25 cursor-pointer flex items-center gap-2"
          >
            <span>View Catalog ({totalProducts})</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <a
            href="https://wa.me/923131664235?text=Hello%20Admin%2C%20I%20have%20an%20inquiry%20regarding%20your%20digital%20products."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-amber-300 hover:text-white bg-[#10121a] hover:bg-[#181a26] border border-amber-500/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Direct WhatsApp Inquiries</span>
            <span className="text-[11px] font-mono text-emerald-400">● 03131664235</span>
          </a>
        </div>

      </div>
    </section>
  );
};
