export interface Product {
  id: string;
  title: string;
  category: string;
  oldPrice?: number | null;
  newPrice: number;
  imageUrl: string;
  description: string;
  affiliateUrl: string;
  sellerName: string;
  isFeatured: boolean;
  isPublished: boolean;
  viewsCount: number;
  clicksCount: number;
  badge?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  iconName?: string;
  count?: number;
}

export type SortOption = 'newest' | 'price-low' | 'price-high' | 'most-popular' | 'biggest-discount';

export interface ProductFilters {
  search: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  featuredOnly: boolean;
  sortBy: SortOption;
}

export interface AnalyticsData {
  totalVisitors: number;
  totalProductViews: number;
  totalAffiliateClicks: number;
  totalProducts: number;
  publishedProducts: number;
  featuredProducts: number;
  topClickedProducts: Product[];
  topViewedProducts: Product[];
  clicksByCategory: Record<string, number>;
  viewsByCategory: Record<string, number>;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  contactEmail: string;
  whatsappNumber?: string;
  announcement: string;
  currency: string;
}

export interface AdminSession {
  token: string;
  username: string;
  expiresAt: number;
}
