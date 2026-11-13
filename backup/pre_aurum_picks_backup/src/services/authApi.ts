import { AppUser } from '../types/user';

const TOKEN_KEY = 'checker_auth_token_v1';
const USER_KEY = 'checker_auth_user_v1';

export const authApi = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCachedUser(): AppUser | null {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  setSession(user: AppUser, token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async verifyReferenceCode(code: string): Promise<{ valid: boolean; referrer?: { id: string; name: string; referenceCode: string } }> {
    try {
      const res = await fetch(`/api/referrals/verify/${encodeURIComponent(code)}`);
      if (!res.ok) return { valid: false };
      return await res.json();
    } catch {
      return { valid: false };
    }
  },

  async register(params: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    referenceCode?: string;
  }): Promise<{ user: AppUser; token: string; message: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create account');
    }

    this.setSession(json.user, json.token);
    return { user: json.user, token: json.token, message: json.message };
  },

  async login(params: {
    email: string;
    password?: string;
  }): Promise<{ user: AppUser; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to sign in');
    }

    this.setSession(json.user, json.token);
    return { user: json.user, token: json.token };
  },

  async getMe(): Promise<AppUser | null> {
    const token = this.getToken();
    try {
      const res = await fetch('/api/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (json.success && json.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(json.user));
        return json.user;
      }
      return null;
    } catch {
      return this.getCachedUser();
    }
  },

  async logout(): Promise<void> {
    const token = this.getToken();
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        });
      }
    } catch {
      // ignore
    } finally {
      this.clearSession();
    }
  },
};
