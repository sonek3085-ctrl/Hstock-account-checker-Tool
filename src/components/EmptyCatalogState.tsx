import React from 'react';
import { PackageOpen, Plus, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';

interface EmptyCatalogStateProps {
  onOpenAdmin: () => void;
  onOpenContact: () => void;
  isFiltered?: boolean;
  onResetFilters?: () => void;
}

export const EmptyCatalogState: React.FC<EmptyCatalogStateProps> = ({
  onOpenAdmin,
  onOpenContact,
  isFiltered,
  onResetFilters
}) => {
  if (isFiltered) {
    return (
      <div className="py-20 px-4 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Matching Products Found</h3>
        <p className="text-sm text-slate-400 mb-6">
          We couldn't find any products matching your specific search or filter criteria. Try clearing filters or searching for another term.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto">
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
          <Sparkles className="w-10 h-10 text-amber-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
          0
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
        <span>Catalog Ready & Awaiting Admin Listings</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
        The Product Catalog Starts <span className="gold-text-gradient font-serif italic">Clean & Empty</span>
      </h2>

      <p className="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed max-w-xl mx-auto">
        In accordance with your strict preferences, zero demo or sample products have been pre-populated. Only genuine affiliate products added manually through the secure <strong>Admin Portal</strong> will appear here for Pakistani shoppers.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-xl shadow-amber-500/25 transition-all duration-200 text-sm active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Admin Portal: Add Your First Product</span>
        </button>

        <button
          onClick={onOpenContact}
          className="flex items-center gap-2 bg-[#121826] hover:bg-[#1A2234] text-slate-300 hover:text-white px-5 py-3.5 rounded-xl border border-slate-700 text-sm font-medium transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>Need Help / Contact Us</span>
        </button>
      </div>

      <div className="mt-12 p-4 rounded-2xl bg-[#121826]/60 border border-slate-800 text-left max-w-lg mx-auto space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Quick Admin Tips for Pakistani Sellers:</span>
        </div>
        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
          <li>Upload real product images or paste Daraz image URLs.</li>
          <li>Enter prices in PKR (Pakistani Rupee).</li>
          <li>Paste your Daraz or partner affiliate tracking URL into the affiliate link field.</li>
          <li>Toggle "Featured" to spotlight top discounts on the homepage.</li>
        </ul>
      </div>
    </div>
  );
};
