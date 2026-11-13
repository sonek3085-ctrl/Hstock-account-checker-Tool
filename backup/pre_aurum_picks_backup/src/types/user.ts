export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  referenceCode: string;
  referredBy?: string;
  referredByName?: string;
  referralCount: number;
  credits: number;
  role: 'user' | 'admin';
  createdAt: string;
  referrals?: ReferredMember[];
}

export interface ReferredMember {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  bonusAwarded: number;
}

export interface AuthState {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ReferralStats {
  referenceCode: string;
  referenceUrl: string;
  totalReferrals: number;
  totalCreditsEarned: number;
  referralsList: ReferredMember[];
}
