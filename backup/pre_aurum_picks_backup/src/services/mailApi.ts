import { Inbox, EmailMessage, DomainOption, ReferenceValidationResponse } from '../types/email';

export interface InboxDataResponse {
  inbox: Inbox;
  messages: EmailMessage[];
}

export const mailApi = {
  async getDomains(): Promise<{ liveDomains: DomainOption[]; customDomains: DomainOption[] }> {
    const res = await fetch('/api/inbox/domains');
    const json = await res.json();
    return json.data;
  },

  async generateInbox(params: {
    username?: string;
    domain?: string;
    expiryMinutes?: number;
  }): Promise<Inbox> {
    const res = await fetch('/api/inbox/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to generate address');
    return json.data;
  },

  async getInbox(address: string, token?: string, shareToken?: string): Promise<InboxDataResponse> {
    const params = new URLSearchParams();
    if (token) params.set('token', token);
    if (shareToken) params.set('shareToken', shareToken);

    const res = await fetch(`/api/inbox/${encodeURIComponent(address)}?${params.toString()}`);
    const json = await res.json();
    if (!json.success) {
      const err = new Error(json.error || 'Failed to retrieve inbox');
      (err as any).reason = json.reason;
      throw err;
    }
    return json.data;
  },

  async deleteInbox(address: string, token: string): Promise<void> {
    const res = await fetch(`/api/inbox/${encodeURIComponent(address)}?token=${encodeURIComponent(token)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to delete inbox');
  },

  async extendExpiry(address: string, token: string, minutes: number = 15): Promise<Inbox> {
    const res = await fetch(`/api/inbox/${encodeURIComponent(address)}/extend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, minutes }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to extend inbox lifetime');
    return json.data;
  },

  async sendTestEmail(address: string): Promise<EmailMessage> {
    const res = await fetch(`/api/inbox/${encodeURIComponent(address)}/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: 'otp' }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to send test email');
    return json.data;
  },

  async validateReferenceLink(address: string, refToken: string): Promise<ReferenceValidationResponse> {
    const res = await fetch('/api/inbox/validate-reference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, refToken }),
    });
    return await res.json();
  },

  async submitContact(data: { name: string; email: string; subject?: string; message: string }): Promise<void> {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to submit message');
  },

  async getStats(): Promise<any> {
    const res = await fetch('/api/stats');
    const json = await res.json();
    return json.data;
  },
};
