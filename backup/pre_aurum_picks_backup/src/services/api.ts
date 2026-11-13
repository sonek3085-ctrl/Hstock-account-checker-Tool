import { DigitalProduct, ProductOrder, StoreSettings } from '../types';

const ADMIN_TOKEN_KEY = 'aurum_admin_token';
const ADMIN_USER_KEY = 'aurum_admin_username';

export function isUserAdmin(): boolean {
  return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminUsername(): string {
  return localStorage.getItem(ADMIN_USER_KEY) || 'admin';
}

export function saveAdminSession(token: string, username: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, username);
}

export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = getAdminToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ==========================================
// 1. PRODUCTS API
// ==========================================

// Public Storefront: Fetch only published Active products
export async function fetchProducts(): Promise<DigitalProduct[]> {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API error fetching products:', err);
  }
  return [];
}

// Admin Panel: Fetch all products (both Active and Draft)
export async function fetchAdminProducts(): Promise<DigitalProduct[]> {
  const res = await fetch('/api/admin/products', { headers: getHeaders() });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch admin products');
  }
  return await res.json();
}

// Add new product
export async function createProduct(
  productData: Omit<DigitalProduct, 'id' | 'createdAt' | 'updatedAt'>
): Promise<DigitalProduct> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to add product');
  }
  return data;
}

// Edit existing product
export async function updateProduct(
  id: string,
  updates: Partial<DigitalProduct>
): Promise<DigitalProduct> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update product');
  }
  return data;
}

// Publish / Unpublish Toggle
export async function togglePublishProduct(
  id: string,
  status?: 'Active' | 'Draft'
): Promise<DigitalProduct> {
  const res = await fetch(`/api/products/${id}/publish`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update publication status');
  }
  return data;
}

// Delete product permanently
export async function deleteProduct(id: string): Promise<boolean> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete product');
  }
  return true;
}

// Upload Product Image (File -> Base64 -> /uploads/public URL)
export async function uploadProductImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 20 * 1024 * 1024) {
      reject(new Error('Image size must be less than 20MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ imageBase64: base64, fileName: file.name }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Upload failed');
        }
        resolve(data.url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error reading image file'));
    reader.readAsDataURL(file);
  });
}

// ==========================================
// 2. ORDERS API
// ==========================================

export async function submitOrder(orderData: {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productId: string;
  notes?: string;
}): Promise<ProductOrder> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit order');
  }
  return data;
}

export async function fetchOrders(): Promise<ProductOrder[]> {
  try {
    const res = await fetch('/api/orders', { headers: getHeaders() });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch orders:', err);
  }
  return [];
}

export async function updateOrderStatus(
  id: string,
  status: ProductOrder['status']
): Promise<ProductOrder> {
  const res = await fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update order status');
  }
  return data;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const res = await fetch(`/api/orders/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.ok;
}

// ==========================================
// 3. ADMIN AUTHENTICATION & SETTINGS
// ==========================================

export async function loginAdmin(username: string, password: string): Promise<boolean> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (res.ok && data.token) {
    saveAdminSession(data.token, data.username || username);
    return true;
  }
  throw new Error(data.error || 'Invalid admin credentials');
}

export async function fetchSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch settings:', err);
  }
  return {
    adminUsername: 'admin',
    adminWhatsApp: '03131664235',
    storeName: 'AURUM DIGITAL',
    storeTagline: 'Exclusive Digital Assets, Templates & Software',
    announcement: '🌟 Official Store — Instant WhatsApp Digital Delivery at 03131664235',
  };
}

export async function updateSettings(settings: Partial<StoreSettings & { adminPassword?: string }>): Promise<StoreSettings> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update settings');
  }
  return data;
}
