import React, { useEffect, useState } from 'react';
import { X, ExternalLink, ShieldCheck, Sparkles, Share2, Tag, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyNow
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const formatPKR = (amount: number) => `Rs. ${amount.toLocaleString('en-PK')}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on AURUM PICKS for ${formatPKR(product.newPrice)}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-[#101625] rounded-3xl border border-amber-500/30 shadow-2xl shadow-black overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-[#0B0F19]/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image */}
          <div className="relative bg-[#0B0F19] flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-800">
            {!imageError ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                onError={() => setImageError(true)}
                className="w-full max-h-[380px] object-contain rounded-2xl"
              />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-amber-400/50">
                <Sparkles className="w-16 h-16 mb-2" />
                <span className="text-sm text-slate-400">AURUM PICKS Curated</span>
              </div>
            )}

            {product.isFeatured && (
              <div className="absolute bottom-4 left-4 bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Pick</span>
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Category & Merchant verification */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified {product.sellerName || 'Daraz'}</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {product.title}
              </h2>

              {/* Price Block */}
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-amber-500/20 space-y-1">
                <div className="text-xs text-slate-400">Price</div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                    {formatPKR(product.newPrice)}
                  </span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Product Overview & Specifications
                  </h4>
                  <div className="text-sm text-slate-300 leading-relaxed max-h-44 overflow-y-auto pr-2 space-y-2">
                    {product.description.split('\n').map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions & Sharing */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              {/* Buy Now Button */}
              <button
                onClick={() => onBuyNow(product)}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold py-3.5 px-6 rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-200 flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                <span>Buy Now on {product.sellerName || 'Daraz.pk'}</span>
                <ExternalLink className="w-4 h-4 text-slate-950" />
              </button>

              {/* Secondary Share Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#121826] hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Share Deal</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="py-2 px-3 rounded-xl bg-[#121826] hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Tag className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* Affiliate Disclosure Notice */}
              <p className="text-[11px] text-slate-400 leading-snug text-center pt-2">
                🔒 <strong>Affiliate Notice:</strong> When you click Buy Now, you are redirected to the official seller's store to finish your checkout safely. Aurum Picks may earn a small referral commission at no additional cost to you.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
