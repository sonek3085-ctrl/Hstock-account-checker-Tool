import React from 'react';
import { DigitalProduct } from '../types';

interface ProductCardProps {
  product: DigitalProduct;
  onBuyClick: (product: DigitalProduct) => void;
  onViewDetails?: (product: DigitalProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onBuyClick,
  onViewDetails,
}) => {
  const hasDiscount = Boolean(product.oldPricePKR && product.oldPricePKR > product.pricePKR);
  const discountPercent = hasDiscount && product.oldPricePKR
    ? Math.round(((product.oldPricePKR - product.pricePKR) / product.oldPricePKR) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-[#0d0e14] border border-amber-500/20 hover:border-amber-400/60 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(212,175,55,0.18)] hover:-translate-y-1">
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#07080c]">
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e14] via-transparent to-transparent opacity-80" />

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
              {product.category}
            </span>
          </div>

          {/* Product Badge (Only displayed if selected by admin) */}
          {product.badge && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md">
                {product.badge}
              </span>
            </div>
          )}

          {/* Discount Percentage Pill */}
          {hasDiscount && (
            <div className="absolute bottom-3 right-3">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded-md shadow-sm">
                -{discountPercent}% OFF
              </span>
            </div>
          )}

          {/* Delivery Method Tag */}
          {product.deliveryMethod && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#07080c]/90 text-amber-200 rounded border border-amber-500/30 backdrop-blur-sm flex items-center gap-1">
                <span>⚡</span> {product.deliveryMethod}
              </span>
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className="p-4 sm:p-5 space-y-3">
          <h3
            onClick={() => onViewDetails?.(product)}
            className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2 min-h-[44px] cursor-pointer"
          >
            {product.title}
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {product.shortDescription || product.description}
          </p>

          {/* Features Bullets (Only if provided) */}
          {product.features && product.features.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              {product.features.slice(0, 3).map((feat, i) => (
                <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & CTA Button */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">
              Price
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                Rs. {product.pricePKR.toLocaleString()}
              </span>
              {/* Old Price Strikethrough (Only displayed if provided) */}
              {product.oldPricePKR && (
                <span className="text-xs font-mono text-slate-500 line-through">
                  Rs. {product.oldPricePKR.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onBuyClick(product)}
            className="py-2.5 px-3.5 sm:px-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-md shadow-amber-500/20"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771z" />
            </svg>
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
