export type ProductStatus = 'Active' | 'Draft';

export interface DigitalProduct {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  shortDescription: string;
  description: string;
  pricePKR: number;
  oldPricePKR?: number;
  badge?: string;
  features: string[];
  deliveryMethod: string;
  whatsappNumber: string;
  status: ProductStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productId: string;
  productTitle: string;
  productCategory?: string;
  productImageUrl?: string;
  pricePKR: number;
  oldPricePKR?: number;
  deliveryMethod?: string;
  notes?: string;
  status: 'Pending' | 'Contacted on WhatsApp' | 'Delivered' | 'Cancelled';
  whatsappUrl?: string;
  createdAt: string;
}

export interface StoreSettings {
  adminUsername: string;
  adminWhatsApp: string;
  storeName: string;
  storeTagline: string;
  announcement: string;
}

export interface AdminSession {
  isAdmin: boolean;
  token: string;
  username: string;
}
