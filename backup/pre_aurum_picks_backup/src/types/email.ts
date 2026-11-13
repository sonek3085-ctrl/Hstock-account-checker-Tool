export interface Inbox {
  id: string;
  address: string;
  username: string;
  domain: string;
  accessToken: string;
  shareToken: string;
  createdAt: string;
  expiresAt: string;
  messagesCount: number;
  isSharedView?: boolean;
  mode?: 'live' | 'test' | 'custom';
}

export interface EmailAttachment {
  filename: string;
  size: string;
  type: string;
}

export interface EmailMessage {
  id: string;
  inboxAddress: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  date: string;
  textBody: string;
  htmlBody: string;
  verificationCode?: string | null;
  isDemo?: boolean;
  read: boolean;
  attachments?: EmailAttachment[];
}

export interface DomainOption {
  domain: string;
  label: string;
  status: 'active' | 'beta';
  description?: string;
}

export interface ReferenceValidationResponse {
  valid: boolean;
  reason?: 'EXPIRED' | 'NOT_FOUND' | 'INVALID_TOKEN' | 'DELETED';
  message: string;
  inbox?: Inbox;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
