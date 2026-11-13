import React from 'react';
import { DigitalProduct } from '../types';

interface ProductDetailModalProps {
  product: DigitalProduct;
  onClose: () => void;
  onBuyClick: (product: DigitalProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyClick,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e0f17] border border-amber-500/35 rounded-2xl p-5 sm:p-7 shadow-2xl my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-[#181a24] cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          {/* Image */}
          <div className="sm:col-span-5">
            <div className="relative aspect-square sm:aspect-auto sm:h-full w-full rounded-xl overflow-hidden border border-amber-500/25 bg-black">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-black/80 backdrop-blur text-amber-300 border border-amber-500/30">
                  {product.category}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="sm:col-span-7 space-y-4">
            <div>
              {product.badge && (
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                  {product.badge}
                </span>
              )}
              <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {product.title}
              </h3>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-amber-300 font-mono">
                Rs. {product.pricePKR.toLocaleString()} PKR
              </span>
              {product.oldPricePKR && (
                <span className="text-xs font-mono text-slate-500 line-through">
                  Rs. {product.oldPricePKR.toLocaleString()} PKR
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description || product.shortDescription}
            </p>

            {/* Features list */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Features & Inclusions:
                </span>
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                      ✓
                    </span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Delivery Method */}
            {product.deliveryMethod && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex items-center gap-2">
                <span className="text-base">🚚</span>
                <span>Delivery: <strong>{product.deliveryMethod}</strong></span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onBuyClick(product);
                }}
                className="flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-95 shadow-md shadow-amber-500/20"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771z" />
                </svg>
                <span>Buy Now via WhatsApp</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 text-xs font-semibold text-slate-400 hover:text-white bg-[#181a24] rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
