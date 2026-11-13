import { Product, AnalyticsData, StoreSettings, ContactMessage, SortOption } from '../types';

const API_BASE = '/api';

export const apiService = {
  // Public APIs
  async getSettings(): Promise<{ settings: StoreSettings; categories: string[] }> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async trackVisitor(): Promise<void> {
    try {
      // Track once per session
      if (!sessionStorage.getItem('aurum_visitor_tracked')) {
        await fetch(`${API_BASE}/analytics/visitor`, { method: 'POST' });
        sessionStorage.setItem('aurum_visitor_tracked', 'true');
      }
    } catch (e) {
      console.warn('Analytics tracking error:', e);
    }
  },

  async getProducts(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    sort?: SortOption;
  }): Promise<{ products: Product[]; total: number; categories: string[]; featuredCount: number }> {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.featured) query.append('featured', 'true');
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    const data = await res.json();
    return data.product;
  },

  async trackAffiliateClick(id: string): Promise<string> {
    const res = await fetch(`${API_BASE}/products/${id}/click`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to track click');
    const data = await res.json();
    return data.affiliateUrl;
  },

  async sendContactMessage(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to send message');
    return result;
  },

  // Admin APIs
  async adminLogin(password: string): Promise<{ token: string; username: string }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async adminLogout(token: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.warn('Logout error:', e);
    }
  },

  async adminVerify(token: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async adminGetProducts(token: string): Promise<{
    products: Product[];
    categories: string[];
    total: number;
    publishedCount: number;
    draftCount: number;
    featuredCount: number;
  }> {
    const res = await fetch(`${API_BASE}/admin/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch admin products');
    return res.json();
  },

  async adminCreateProduct(token: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(product)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create product');
    return data.product;
  },

  async adminUpdateProduct(token: string, id: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(product)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update product');
    return data.product;
  },

  async adminDeleteProduct(token: string, id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  async adminTogglePublish(token: string, id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/products/${id}/toggle-publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to toggle publish status');
    return data.isPublished;
  },

  async adminToggleFeatured(token: string, id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/products/${id}/toggle-featured`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Failed to toggle featured status');
    return data.isFeatured;
  },

  async adminGetAnalytics(token: string): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async adminGetMessages(token: string): Promise<ContactMessage[]> {
    const res = await fetch(`${API_BASE}/admin/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    const data = await res.json();
    return data.messages;
  },

  async adminDeleteMessage(token: string, id: string): Promise<void> {
    await fetch(`${API_BASE}/admin/messages/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async adminUpdateSettings(token: string, settings: Partial<StoreSettings> & { newPassword?: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
  },

  async adminAddCategory(token: string, name: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    return data.categories;
  }
};
