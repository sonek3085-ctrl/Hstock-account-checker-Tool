import { AccountCheckResult, SocialPlatform, AccountStatus, ResultCategory } from '../types/status';

export function getCategoryFromStatus(status: AccountStatus): 'LIVE' | 'SUSPENDED' | 'NOT_FOUND' | 'UNVERIFIED' | 'PRIVATE' {
  if (status === 'LIVE' || status === 'AVAILABLE') return 'LIVE';
  if (status === 'SUSPENDED' || status === 'BANNED') return 'SUSPENDED';
  if (status === 'NOT_FOUND' || status === 'UNAVAILABLE') return 'NOT_FOUND';
  if (status === 'PRIVATE') return 'PRIVATE';
  return 'UNVERIFIED';
}

export const checkerApi = {
  // 1. Fetch all accounts saved in backend storage
  async fetchSavedAccounts(): Promise<AccountCheckResult[]> {
    try {
      const res = await fetch('/api/accounts');
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.accounts) ? json.accounts : [];
    } catch (e) {
      console.warn('Could not fetch accounts from backend API, using client fallback', e);
      return [];
    }
  },

  // 2. Persist/sync accounts to backend storage
  async syncAccounts(accounts: AccountCheckResult[]): Promise<void> {
    try {
      await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts }),
      });
    } catch (e) {
      console.warn('Failed to sync accounts to backend', e);
    }
  },

  // 3. Check a single account
  async checkAccount(input: string, platform: SocialPlatform, id?: string): Promise<AccountCheckResult> {
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, platform, id }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to check account');
    return json.result;
  },

  // 3b. Manually update account status in backend
  async updateAccountStatus(id: string, status: AccountStatus): Promise<AccountCheckResult | null> {
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      return data.account || null;
    } catch (e) {
      console.error('Failed to update account status:', e);
      return null;
    }
  },

  // 4. Delete an individual account by ID permanently from backend
  async deleteAccount(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/accounts/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return Boolean(data.success);
    } catch (e) {
      console.error('Delete account API error:', e);
      return false;
    }
  },

  // 5. Delete all accounts in a specific category (LIVE, SUSPENDED, NOT_FOUND, UNVERIFIED)
  async deleteCategory(category: 'LIVE' | 'SUSPENDED' | 'NOT_FOUND' | 'UNVERIFIED' | 'PRIVATE'): Promise<boolean> {
    try {
      const res = await fetch(`/api/accounts?type=category&status=${encodeURIComponent(category)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return Boolean(data.success);
    } catch (e) {
      console.error('Delete category API error:', e);
      return false;
    }
  },

  // 6. Delete multiple accounts by IDs
  async deleteSelected(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;
    try {
      const res = await fetch('/api/accounts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      return Boolean(data.success);
    } catch (e) {
      console.error('Delete selected API error:', e);
      return false;
    }
  },

  // 7. Clear all accounts permanently from backend database
  async clearAllAccounts(): Promise<boolean> {
    try {
      const res = await fetch('/api/accounts?type=all', {
        method: 'DELETE',
      });
      const data = await res.json();
      return Boolean(data.success);
    } catch (e) {
      console.error('Clear all API error:', e);
      return false;
    }
  },

  // 8. Backward-compatible alias
  async clearHistory(): Promise<void> {
    await this.clearAllAccounts();
  },

  // 9. Export results to CSV
  exportCsv(results: AccountCheckResult[], filenamePrefix: string = 'instagram_account_checker'): void {
    if (results.length === 0) return;

    const headers = [
      'Category',
      'Platform',
      'Account / Handle',
      'Profile URL',
      'Status',
      'Last Checked',
      'Verification Details',
    ];

    const rows = results.map((r) => {
      const category = getCategoryFromStatus(r.status);
      return [
        `"${category}"`,
        `"${r.platform.toUpperCase()}"`,
        `"${r.username.replace(/"/g, '""')}"`,
        `"${r.profileUrl.replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${r.checkedAt}"`,
        `"${(r.details || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
