import React, { useState } from 'react';
import { ExternalLink, Eye, Sparkles, ShieldCheck } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onBuyNow
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPKR = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-PK')}`;
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#121826] rounded-2xl border border-amber-500/20 hover:border-amber-400/60 overflow-hidden shadow-lg shadow-black/40 hover:shadow-amber-500/10 transition-all duration-300 flex flex-col h-full"
    >
      {/* Top badges bar */}
      <div className="relative aspect-square w-full bg-[#0B0F19] overflow-hidden">
        {/* Product image */}
        {!imageError ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F1523] text-amber-400/60 p-4 text-center">
            <Sparkles className="w-12 h-12 mb-2 text-amber-500/40" />
            <span className="text-xs text-slate-400 font-medium">Aurum Curated Pick</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/30 transition-opacity duration-300 ${
          isHovered ? 'opacity-80' : 'opacity-40'
        }`} />


        {/* Featured / Promo Badge */}
        {product.isFeatured && (
          <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-slate-950" />
            <span>FEATURED</span>
          </div>
        )}

        {/* Custom badge if set */}
        {!product.isFeatured && product.badge && (
          <div className="absolute top-3 right-3 bg-slate-900/90 text-amber-400 border border-amber-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm">
            {product.badge}
          </div>
        )}

        {/* Quick View Button overlay on hover */}
        <button
          onClick={() => onQuickView(product)}
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#0B0F19]/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-semibold text-xs px-4 py-2 rounded-xl backdrop-blur-md transition-all duration-200 flex items-center gap-1.5 shadow-lg cursor-pointer ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          
          {/* Category & Seller badge */}
          <div className="flex items-center justify-between text-[11px] gap-2">
            <span className="text-amber-400/90 font-medium truncate uppercase tracking-wider">
              {product.category}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md shrink-0 border border-slate-700/50">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{product.sellerName || 'Daraz.pk'}</span>
            </span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-semibold text-sm sm:text-base text-slate-100 hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Pricing */}
          <div className="pt-1">
            <span className="text-lg sm:text-xl font-extrabold text-amber-400 tracking-tight">
              {formatPKR(product.newPrice)}
            </span>
          </div>
        </div>

        {/* Action Button: Buy Now */}
        <div className="pt-4 mt-2 border-t border-slate-800/80">
          <button
            onClick={() => onBuyNow(product)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/15 hover:shadow-amber-500/25 transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-98 cursor-pointer"
          >
            <span>Buy on {product.sellerName || 'Daraz'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
          </button>
          <p className="text-[10px] text-center text-slate-500 mt-1.5">
            Opens direct checkout at verified seller
          </p>
        </div>
      </div>
    </div>
  );
};
