import React from 'react';
import { Tag, Sparkles } from 'lucide-react';

interface CategoryBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  productsCounts: Record<string, number>;
  totalProducts: number;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  productsCounts,
  totalProducts
}) => {
  return (
    <div className="w-full border-b border-amber-500/20 bg-[#0B0F19]/80 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {/* All category pill */}
          <button
            onClick={() => onSelectCategory('All')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-[#121826] text-slate-300 hover:text-white hover:bg-[#1A2234] border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Categories</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              selectedCategory === 'All' ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400'
            }`}>
              {totalProducts}
            </span>
          </button>

          {/* Dynamic categories */}
          {categories.map((category) => {
            const count = productsCounts[category] || 0;
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                    : 'bg-[#121826] text-slate-300 hover:text-white hover:bg-[#1A2234] border border-slate-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-amber-400/80" />
                <span>{category}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
