import {
  AppUser,
  PaymentRequest,
  CheckBatch,
  SocialPlatform,
  CheckMode,
  AccountResult,
  SystemSettings,
  DEFAULT_SETTINGS,
  ApiIntegrationStatus,
  CloudflareTrafficStats,
  SupportTicket,
  AdminReportData,
  UserShareLink
} from '../types/hstock';

const TOKEN_KEY = 'hstock_auth_token_v1';

class HstockApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // --- Auth API ---

  async register(name: string, email: string, password: string, phone?: string, otpCode?: string, inviteCode?: string): Promise<{ user: AppUser; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, otpCode, inviteCode })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string): Promise<{ user: AppUser; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Invalid credentials');
    }
    const data = await res.json();
    this.setToken(data.token);
    return data;
  }

  async sendOtp(email: string, type: 'email_verification' | 'forgot_password' = 'email_verification'): Promise<{ success: boolean; message: string; devOtp?: string; recoveryCode?: string }> {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to send OTP' }));
      throw new Error(err.error || 'Failed to send verification code');
    }
    return await res.json();
  }

  async sendRecoveryCode(email: string): Promise<{ success: boolean; message: string; recoveryCode: string; devOtp?: string; expiresMinutes?: number }> {
    const res = await this.sendOtp(email, 'forgot_password');
    return {
      success: res.success,
      message: res.message,
      recoveryCode: res.recoveryCode || res.devOtp || '',
      devOtp: res.devOtp,
      expiresMinutes: 15
    };
  }

  async verifyOtp(email: string, code: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Verification failed' }));
      throw new Error(err.error || 'Invalid verification code');
    }
    return await res.json();
  }

  async resetPasswordWithOtp(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Password reset failed' }));
      throw new Error(err.error || 'Password reset failed');
    }
    return await res.json();
  }

  async getMe(): Promise<AppUser | null> {
    try {
      if (this.token) {
        const res = await fetch('/api/auth/me', {
          headers: this.getHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          return data.user;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async updateProfile(payload: {
    name?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<{ success: boolean; user: AppUser; message: string }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update profile' }));
      throw new Error(err.error || 'Failed to update profile');
    }
    return await res.json();
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: this.getHeaders()
      });
    } catch {}
    this.setToken(null);
  }

  // --- Settings API ---

  async getSettings(): Promise<SystemSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return DEFAULT_SETTINGS;
  }

  async getAdminSettings(): Promise<SystemSettings> {
    const res = await fetch('/api/admin/settings', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Unauthorized');
    return await res.json();
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(settings)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update settings' }));
      throw new Error(err.error || 'Failed to update settings');
    }
    return await res.json();
  }

  // --- Binance USDT (BEP20) Payments & Deposits API ---

  async submitDeposit(payload: {
    amountUsd: number;
    transactionId: string;
    screenshotUrl?: string;
  }): Promise<{ payment: PaymentRequest; blockchainVerification?: any }> {
    const res = await fetch('/api/payments/submit', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Deposit submission failed' }));
      throw new Error(err.error || 'Failed to submit USDT deposit');
    }
    return await res.json();
  }

  async submitPayment(payload: {
    amountPkr?: number;
    amountUsd: number;
    senderNumber?: string;
    transactionId: string;
    screenshotUrl?: string;
  }): Promise<PaymentRequest> {
    const res = await this.submitDeposit({
      amountUsd: payload.amountUsd,
      transactionId: payload.transactionId,
      screenshotUrl: payload.screenshotUrl
    });
    return res.payment;
  }

  async verifyTxOnBlockchain(id: string): Promise<{ payment: PaymentRequest; verification: any }> {
    const res = await fetch(`/api/payments/${id}/verify-blockchain`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Verification failed' }));
      throw new Error(err.error || 'Failed to verify on BNB Smart Chain');
    }
    return await res.json();
  }

  async getMyPayments(): Promise<PaymentRequest[]> {
    const res = await fetch('/api/payments/my', {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.payments || [];
  }

  async getMyTransactions(): Promise<any[]> {
    const res = await fetch('/api/payments/transactions/my', {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.transactions || [];
  }

  async getAllPayments(): Promise<PaymentRequest[]> {
    const res = await fetch('/api/payments/all', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Unauthorized');
    const data = await res.json();
    return data.payments || [];
  }

  async approvePayment(id: string): Promise<{ payment: PaymentRequest; user: AppUser }> {
    const res = await fetch(`/api/payments/${id}/approve`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to approve payment' }));
      throw new Error(err.error || 'Failed to approve payment');
    }
    return await res.json();
  }

  async rejectPayment(id: string, reason: string): Promise<PaymentRequest> {
    const res = await fetch(`/api/payments/${id}/reject`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to reject payment' }));
      throw new Error(err.error || 'Failed to reject payment');
    }
    const data = await res.json();
    return data.payment;
  }

  // --- Share Results Engine API ---

  async createShareLink(payload: {
    title?: string;
    platform: SocialPlatform;
    mode: CheckMode;
    results: AccountResult[];
  }): Promise<{ share: any; shareId: string }> {
    const res = await fetch('/api/share/create', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create share link' }));
      throw new Error(err.error || 'Failed to generate shareable link');
    }
    return await res.json();
  }

  async getSharedResult(shareId: string): Promise<any> {
    const res = await fetch(`/api/share/${shareId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Shared report not found' }));
      throw new Error(err.error || 'Shared report not found or expired');
    }
    return await res.json();
  }

  async revokeShareLink(shareId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/share/${shareId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to revoke link' }));
      throw new Error(err.error || 'Failed to revoke share link');
    }
    return await res.json();
  }

  async getMyShares(): Promise<any[]> {
    const res = await fetch('/api/share/my', {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.shares || [];
  }

  // --- Checker API ---

  async runBatchCheck(payload: {
    accounts: string[];
    platform: SocialPlatform;
    mode: CheckMode;
  }): Promise<{ batch: CheckBatch; user: AppUser }> {
    const res = await fetch('/api/checker/run', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Verification failed' }));
      throw new Error(err.error || 'Check failed. Insufficient balance or invalid input.');
    }
    return await res.json();
  }

  async getMyHistory(): Promise<CheckBatch[]> {
    const res = await fetch('/api/checker/history', {
      headers: this.getHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.batches || [];
  }

  // --- Admin User Management ---

  async getAdminUsers(): Promise<(AppUser & { batchesCount?: number; totalAccountsChecked?: number; pendingDeposits?: number })[]> {
    const res = await fetch('/api/admin/users', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Unauthorized');
    const data = await res.json();
    return data.users || [];
  }

  async getAdminUserDetails(userId: string): Promise<{
    user: AppUser;
    batches: CheckBatch[];
    payments: PaymentRequest[];
    transactions: any[];
  }> {
    const res = await fetch(`/api/admin/users/${userId}/details`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load user details');
    return await res.json();
  }

  async updateAdminUserStatus(userId: string, status: 'active' | 'suspended'): Promise<AppUser> {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update status' }));
      throw new Error(err.error || 'Failed to update user status');
    }
    const data = await res.json();
    return data.user;
  }

  async getAdminActivity(): Promise<{ batches: (CheckBatch & { userName?: string; userEmail?: string })[]; transactions: any[] }> {
    const res = await fetch('/api/admin/activity', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch activity');
    return await res.json();
  }

  async adjustUserBalance(userId: string, amountUsd: number, action: 'add' | 'set'): Promise<AppUser> {
    const res = await fetch(`/api/admin/users/${userId}/balance`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ amountUsd, action })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to adjust balance' }));
      throw new Error(err.error || 'Failed to adjust balance');
    }
    const data = await res.json();
    return data.user;
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalRevenuePkr: number;
    totalRevenueUsd: number;
    totalChecksPerformed: number;
    pendingPaymentsCount: number;
  }> {
    const res = await fetch('/api/admin/stats', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Unauthorized');
    return await res.json();
  }

  // --- API Integrations Engine ---

  async getApiIntegrations(): Promise<ApiIntegrationStatus[]> {
    const res = await fetch('/api/admin/api-integrations', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch API integrations');
    const data = await res.json();
    return data.integrations || [];
  }

  async testApiIntegration(platform: string): Promise<{
    success: boolean;
    message: string;
    latencyMs: number;
    details?: any;
  }> {
    const res = await fetch('/api/admin/test-api', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ platform })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'API integration test failed');
    }
    return data;
  }

  async updateApiKeys(keys: {
    youtubeApiKey?: string;
    metaGraphToken?: string;
    threadsToken?: string;
    githubToken?: string;
  }): Promise<SystemSettings> {
    const res = await fetch('/api/admin/api-keys', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(keys)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update API keys' }));
      throw new Error(err.error || 'Failed to update API keys');
    }
    return await res.json();
  }

  // --- Cloudflare & Traffic Management ---

  async getCloudflareStatus(): Promise<CloudflareTrafficStats> {
    const res = await fetch('/api/admin/cloudflare/status', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch Cloudflare status');
    return await res.json();
  }

  async updateCloudflareConfig(config: {
    cloudflareEnabled?: boolean;
    cloudflareZoneId?: string;
    cloudflareApiToken?: string;
    cloudflareTurnstileSiteKey?: string;
    cloudflareTurnstileSecretKey?: string;
    cloudflareSecurityLevel?: 'off' | 'low' | 'medium' | 'high' | 'under_attack';
    cloudflareBotFightMode?: boolean;
    rateLimitPerMin?: number;
  }): Promise<{ success: boolean; settings: SystemSettings }> {
    const res = await fetch('/api/admin/cloudflare/config', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(config)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update Cloudflare settings' }));
      throw new Error(err.error || 'Failed to update Cloudflare settings');
    }
    return await res.json();
  }

  async testCloudflare(): Promise<{
    success: boolean;
    message: string;
    latencyMs: number;
    rayId?: string;
    zoneInfo?: any;
  }> {
    const res = await fetch('/api/admin/cloudflare/test', {
      method: 'POST',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Cloudflare test failed');
    }
    return data;
  }



  async resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to reset password' }));
      throw new Error(err.error || 'Failed to reset password');
    }
    return await res.json();
  }

  async verifyEmail(email: string, code: string): Promise<{ success: boolean; user: AppUser }> {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, code })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Email verification failed' }));
      throw new Error(err.error || 'Email verification failed');
    }
    return await res.json();
  }

  // --- Customer Support API ---

  async submitSupportTicket(ticket: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    priority?: 'low' | 'normal' | 'urgent';
  }): Promise<{ success: boolean; ticket: SupportTicket }> {
    const res = await fetch('/api/support/ticket', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(ticket)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to submit support ticket' }));
      throw new Error(err.error || 'Failed to submit ticket');
    }
    return await res.json();
  }

  async getAdminSupportTickets(): Promise<SupportTicket[]> {
    const res = await fetch('/api/admin/support/tickets', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch support tickets');
    const data = await res.json();
    return data.tickets || [];
  }

  async replySupportTicket(ticketId: string, adminReply: string, status?: string): Promise<SupportTicket> {
    const res = await fetch(`/api/admin/support/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ adminReply, status })
    });
    if (!res.ok) throw new Error('Failed to update ticket');
    const data = await res.json();
    return data.ticket;
  }

  // --- Admin Reports API ---

  async getAdminReports(period?: string): Promise<AdminReportData> {
    const query = period ? `?period=${encodeURIComponent(period)}` : '';
    const res = await fetch(`/api/admin/reports${query}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load admin reports');
    return await res.json();
  }

  // --- Database Backup & Recovery API ---

  async getBackupData(): Promise<any> {
    const res = await fetch('/api/admin/backup', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to generate backup');
    return await res.json();
  }

  async downloadSourceZip(): Promise<Blob> {
    const res = await fetch('/api/admin/export-source-zip', {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to download source archive' }));
      throw new Error(err.error || 'Failed to download source code ZIP');
    }
    return await res.blob();
  }

  async restoreBackup(backupData: any): Promise<{ success: boolean; message: string; counts: any }> {
    const res = await fetch('/api/admin/restore', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ backup: backupData })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Restore failed' }));
      throw new Error(err.error || 'Restore failed');
    }
    return await res.json();
  }

  async toggleMaintenanceMode(enabled: boolean, message?: string): Promise<{ success: boolean; maintenanceMode: boolean; maintenanceMessage: string }> {
    const res = await fetch('/api/admin/maintenance', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ enabled, message })
    });
    if (!res.ok) throw new Error('Failed to update maintenance mode');
    return await res.json();
  }

  // --- User Share Link Generator Tool API ---

  async validateShareLink(code: string): Promise<{
    valid: boolean;
    paused?: boolean;
    code: string;
    label?: string;
    bannerText?: string;
    lockedCustomerOnly: boolean;
    rateLiveness?: number;
    rateDetails?: number;
  }> {
    const res = await fetch(`/api/public/share-link/${encodeURIComponent(code)}`);
    if (!res.ok) {
      return { valid: false, code, lockedCustomerOnly: true };
    }
    return await res.json();
  }

  async getAdminShareLinks(): Promise<UserShareLink[]> {
    const res = await fetch('/api/admin/share-links', {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load user share links');
    const data = await res.json();
    return data.shareLinks || [];
  }

  async createAdminShareLink(payload: {
    label: string;
    code?: string;
    bannerText?: string;
  }): Promise<UserShareLink> {
    const res = await fetch('/api/admin/share-links', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create share link' }));
      throw new Error(err.error || 'Failed to create share link');
    }
    const data = await res.json();
    return data.shareLink;
  }

  async toggleAdminShareLink(id: string, isActive: boolean): Promise<UserShareLink> {
    const res = await fetch(`/api/admin/share-links/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ isActive })
    });
    if (!res.ok) throw new Error('Failed to update share link');
    const data = await res.json();
    return data.shareLink;
  }

  async deleteAdminShareLink(id: string): Promise<void> {
    const res = await fetch(`/api/admin/share-links/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete share link');
  }
}

export const hstockApi = new HstockApiService();
