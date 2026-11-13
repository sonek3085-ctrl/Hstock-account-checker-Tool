import React, { useState, useMemo } from 'react';
import { DigitalProduct } from '../types';
import { ProductCard } from './ProductCard';

interface ProductStoreProps {
  products: DigitalProduct[]; // published products only
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBuyProduct: (product: DigitalProduct) => void;
  onViewDetails: (product: DigitalProduct) => void;
}

export const ProductStore: React.FC<ProductStoreProps> = ({
  products,
  searchQuery,
  onSearchChange,
  onBuyProduct,
  onViewDetails,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');

  // Extract unique categories dynamically from actual published products
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('All');
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [products]);

  // Featured Products
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.isFeatured);
  }, [products]);

  // Filter & sort all products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch =
          !searchQuery.trim() ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.badge && p.badge.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.pricePKR - b.pricePKR;
        if (sortBy === 'price-desc') return b.pricePKR - a.pricePKR;
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'featured') {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
        }
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section id="products-section" className="py-12 sm:py-16 bg-[#07080b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* If product catalog is empty */}
        {products.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-[#0c0d14] border border-amber-500/20 p-8 sm:p-12 max-w-xl mx-auto shadow-2xl space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl shadow-lg shadow-amber-500/10">
              👑
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              No products available yet. Please check back soon.
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Our digital catalog is being updated. Products added via the Admin Panel will be published here automatically.
            </p>
          </div>
        ) : (
          <>
            {/* FEATURED PRODUCTS SPOTLIGHT (Only if products are marked as featured) */}
            {featuredProducts.length > 0 && selectedCategory === 'All' && !searchQuery && (
              <div className="mb-14 pb-12 border-b border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-400 text-sm">★</span>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                    Featured Collection
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-6">
                  Highlighted Premium Assets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={`featured-${product.id}`}
                      product={product}
                      onBuyClick={onBuyProduct}
                      onViewDetails={onViewDetails}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Catalog Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] uppercase font-bold tracking-widest text-amber-400">
                    Product Catalog
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400">Published Listings</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  All Available Products
                </h2>
              </div>

              <div className="text-xs text-amber-300 font-semibold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/25 self-start md:self-auto font-mono">
                {filteredProducts.length} Product{filteredProducts.length === 1 ? '' : 's'} Available
              </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="space-y-4 mb-8">
              
              {/* Category Filter Chips (Dynamically populated from published products) */}
              {categories.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map((cat) => {
                    const active = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-[#101218] text-slate-300 hover:text-white hover:bg-[#181a24] border border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Search & Sort Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <div className="sm:col-span-8 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by product name, category, or features..."
                    className="w-full px-4 py-2.5 pl-10 rounded-xl bg-[#0f1016] border border-amber-500/25 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <svg
                    className="w-4 h-4 text-amber-400/80 absolute left-3.5 top-3 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-3 top-2.5 text-[11px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-[#1a1b24] cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f1016] border border-amber-500/25 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="featured">Sort: Featured First</option>
                    <option value="newest">Sort: Newest Added</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center rounded-2xl bg-[#0b0c12] border border-amber-500/20 p-8 max-w-md mx-auto space-y-3">
                <p className="text-sm font-bold text-white">No products found matching your search</p>
                <p className="text-xs text-slate-400">Try adjusting your keywords or clearing the category filter.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    onSearchChange('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 rounded-xl cursor-pointer"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onBuyClick={onBuyProduct}
                    onViewDetails={onViewDetails}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
};
