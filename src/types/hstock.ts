export type SocialPlatform =
  | 'auto'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'youtube'
  | 'threads'
  | 'twitter'
  | 'telegram'
  | 'github'
  | 'gmail'
  | 'meta';

export type CheckMode = 'liveness' | 'details';

export type AccountStatus =
  | 'ACCOUNT_FOUND'
  | 'ACCOUNT_NOT_FOUND'
  | 'USERNAME_CHANGED'
  | 'UNABLE_TO_VERIFY'
  | 'LIVE'
  | 'DEAD'
  | 'BANNED'
  | 'UNVERIFIED'
  | 'API_BLOCKED'
  | 'UNKNOWN';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  balance: number; // in USD
  totalDeposited: number;
  totalSpent: number;
  createdAt: string;
  status: 'active' | 'suspended';
  emailVerified?: boolean;
  invitedByCode?: string;
}

export interface UserShareLink {
  id: string;
  code: string;
  label: string;
  bannerText?: string;
  isActive: boolean;
  lockedCustomerOnly: boolean;
  clicks: number;
  registrations: number;
  createdAt: string;
  createdBy: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amountUsd: number; // $1 - $100
  currency: 'USDT';
  network: 'BEP20';
  receivingAddress: string;
  transactionId: string; // TXID
  blockchainStatus?: 'UNVERIFIED' | 'CONFIRMED' | 'FAILED' | 'MISMATCH' | 'PENDING';
  confirmations?: number;
  blockNumber?: number;
  fromAddress?: string;
  screenshotUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AccountResult {
  id: string;
  platform: SocialPlatform;
  handle: string;
  rawInput: string;
  url: string;
  status: AccountStatus;
  mode: CheckMode;
  name?: string;
  followers?: string | number;
  following?: string | number;
  posts?: string | number;
  isVerified?: boolean;
  avatarUrl?: string;
  details: string;
  statusCode?: number;
  latencyMs?: number;
  checkedAt: string;
}

export interface CheckBatch {
  id: string;
  userId: string;
  timestamp: string;
  platform: SocialPlatform;
  mode: CheckMode;
  accountsCount: number;
  cost: number;
  liveCount: number;
  deadCount: number;
  bannedCount: number;
  unverifiedCount?: number;
  apiBlockedCount?: number;
  balanceAfter: number;
  results: AccountResult[];
}

export interface SharedResultShare {
  id: string;
  userId: string;
  userName: string;
  title: string;
  platform: SocialPlatform;
  mode: CheckMode;
  accountsCount: number;
  liveCount: number;
  deadCount: number;
  results: AccountResult[];
  createdAt: string;
  isRevoked?: boolean;
}

export interface SystemSettings {
  usdtWalletAddress: string; // 0xe7d33cb98982b45e3f4d80c71239cb6b3dfef8ef
  usdtNetwork: string; // BNB Smart Chain (BEP20)
  minDepositUsd: number; // 1
  maxDepositUsd: number; // 100
  usdtTokenContract: string; // 0x55d398326f99059fF775485246999027B3197955
  bscRpcUrl: string; // https://bsc-dataseed.binance.org/
  rateLiveness: number; // fallback: $0.0025
  rateDetails: number;  // fallback: $0.0035
  youtubeApiKey?: string;
  metaGraphToken?: string;
  threadsToken?: string;
  githubToken?: string;
  twitterBearerToken?: string;
  telegramBotToken?: string;
  // Per-platform and per-mode pricing matrix
  platformPricing?: Partial<Record<SocialPlatform, { liveness: number; details: number }>>;
  // Maintenance Mode
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  // Cloudflare & API Traffic Management
  cloudflareEnabled?: boolean;
  cloudflareZoneId?: string;
  cloudflareApiToken?: string;
  cloudflareTurnstileSiteKey?: string;
  cloudflareTurnstileSecretKey?: string;
  cloudflareSecurityLevel?: 'off' | 'low' | 'medium' | 'high' | 'under_attack';
  cloudflareBotFightMode?: boolean;
  rateLimitPerMin?: number; // e.g. 120 requests/minute
}

export interface WalletTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'DEPOSIT' | 'CHECK_DEDUCTION' | 'REFUND' | 'ADMIN_ADJUSTMENT';
  amountUsd: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string; // batchId or paymentId
  description: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  phone?: string;
  subject: string;
  message: string;
  priority: 'low' | 'normal' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
}

export interface AdminReportData {
  period: string;
  totalRevenueUsd: number;
  totalChecks: number;
  registeredUsersCount: number;
  activeUsersCount: number;
  totalPaymentsSubmitted: number;
  approvedPaymentsCount: number;
  rejectedPaymentsCount: number;
  pendingPaymentsCount: number;
  platformBreakdown: Record<string, { count: number; cost: number }>;
  statusBreakdown: Record<string, number>;
  dailyRevenue: { date: string; revenueUsd: number; checksCount: number }[];
  recentTransactions: WalletTransaction[];
}

export interface CloudflareTrafficStats {
  status: 'ACTIVE' | 'STANDBY' | 'PROTECTED';
  securityLevel: string;
  botFightMode: boolean;
  rateLimitPerMin: number;
  totalRequests: number;
  proxiedRequests: number;
  blockedRequests: number;
  rateLimitedRequests: number;
  activeIpCount: number;
  lastRayId: string;
  clientIp: string;
  detectedCountry: string;
  isCloudflareProxy: boolean;
}

export interface ApiIntegrationStatus {
  id: 'youtube' | 'meta' | 'threads' | 'github' | 'tiktok' | 'twitter' | 'telegram' | 'gmail';
  name: string;
  officialApi: string;
  isKeyConfigured: boolean;
  mode: 'AUTHENTICATED_API' | 'PERMITTED_PUBLIC_API';
  status: 'ONLINE' | 'STANDBY' | 'ERROR';
  description: string;
  lastTestedAt?: string;
  lastLatencyMs?: number;
  testSample: string;
}

export const DEFAULT_PLATFORM_PRICING: Record<SocialPlatform, { liveness: number; details: number }> = {
  instagram: { liveness: 0.0025, details: 0.0035 },
  tiktok: { liveness: 0.0025, details: 0.0035 },
  facebook: { liveness: 0.0025, details: 0.0035 },
  youtube: { liveness: 0.0020, details: 0.0030 },
  threads: { liveness: 0.0025, details: 0.0035 },
  twitter: { liveness: 0.0025, details: 0.0035 },
  telegram: { liveness: 0.0020, details: 0.0030 },
  github: { liveness: 0.0020, details: 0.0030 },
  gmail: { liveness: 0.0020, details: 0.0030 },
  meta: { liveness: 0.0025, details: 0.0035 },
  auto: { liveness: 0.0025, details: 0.0035 }
};

export const DEFAULT_SETTINGS: SystemSettings = {
  usdtWalletAddress: '0xe7d33cb98982b45e3f4d80c71239cb6b3dfef8ef',
  usdtNetwork: 'BNB Smart Chain (BEP20)',
  minDepositUsd: 1.0,
  maxDepositUsd: 100.0,
  usdtTokenContract: '0x55d398326f99059fF775485246999027B3197955',
  bscRpcUrl: 'https://bsc-dataseed.binance.org/',
  rateLiveness: 0.0025,
  rateDetails: 0.0035,
  youtubeApiKey: '',
  metaGraphToken: '',
  threadsToken: '',
  githubToken: '',
  twitterBearerToken: '',
  telegramBotToken: '',
  platformPricing: DEFAULT_PLATFORM_PRICING,
  maintenanceMode: false,
  maintenanceMessage: 'Hstock Account Checker is currently undergoing scheduled platform upgrades and security maintenance. All user balances and histories are safe. We will be back online shortly!',
  cloudflareEnabled: true,
  cloudflareZoneId: '',
  cloudflareApiToken: '',
  cloudflareTurnstileSiteKey: '',
  cloudflareTurnstileSecretKey: '',
  cloudflareSecurityLevel: 'medium',
  cloudflareBotFightMode: true,
  rateLimitPerMin: 120
};

export const PLATFORM_INFO: Record<SocialPlatform, { name: string; tag: string; placeholder: string; sample: string[]; description: string }> = {
  auto: {
    name: 'Auto-Detect',
    tag: 'AI Smart',
    description: 'Auto-detect platform from URLs, @handles or email formats',
    placeholder: 'Paste any profile URL or handle (e.g. https://x.com/elonmusk, https://t.me/durov, https://www.tiktok.com/@tiktok, torvalds)',
    sample: [
      'https://x.com/elonmusk',
      'https://t.me/durov',
      'https://www.tiktok.com/@khaby.lame',
      'https://www.youtube.com/@MrBeast',
      'https://github.com/torvalds',
      'https://www.instagram.com/blushangel_8'
    ]
  },
  instagram: {
    name: 'Instagram',
    tag: 'IG Pro',
    description: 'Verify Instagram public profile existence, handle availability & activity',
    placeholder: 'Paste Instagram usernames or links (e.g. blushangel_8, cristiano, leomessi)',
    sample: ['blushangel_8', 'cristiano', 'leomessi', 'selenagomez', 'mrbeast', 'nonexistent_user_998273', 'natgeo']
  },
  tiktok: {
    name: 'TikTok',
    tag: 'TT Fast',
    description: 'Check TikTok creator handle status via official oEmbed verification',
    placeholder: 'Paste TikTok handles or URLs (e.g. https://www.tiktok.com/@khaby.lame, charlidamelio)',
    sample: ['khaby.lame', 'charlidamelio', 'bellapoarch', 'tiktok', 'tiktok_user_not_found_883', 'zachking']
  },
  facebook: {
    name: 'Facebook',
    tag: 'FB Graph',
    description: 'Verify Facebook pages, public profiles and vanity handles',
    placeholder: 'Paste Facebook page names or user IDs (e.g. Meta, zuck, Google)',
    sample: ['Meta', 'zuck', 'Google', 'SamsungGlobal', 'deleted_page_nonexistent_882', 'bbcnews']
  },
  youtube: {
    name: 'YouTube',
    tag: 'YT Channel',
    description: 'Probe YouTube channel existence, subscriber count and video statistics',
    placeholder: 'Paste YouTube channel handles or links (e.g. https://www.youtube.com/@MrBeast, mkbhd)',
    sample: ['MrBeast', 'mkbhd', 'verge', 'TED', 'non_existent_channel_889218']
  },
  threads: {
    name: 'Threads',
    tag: 'Threads',
    description: 'Check Threads public creator profile availability and live status',
    placeholder: 'Paste Threads handles (e.g. zuck, mrbeast, verge)',
    sample: ['zuck', 'mrbeast', 'verge', 'mkbhd', 'threads_ghost_account_404', 'mosseri']
  },
  twitter: {
    name: 'X (Twitter)',
    tag: 'X Live',
    description: 'Verify Twitter/X accounts, suspension status and handle existence',
    placeholder: 'Paste Twitter/X handles or links (e.g. https://x.com/elonmusk, nasa, openai)',
    sample: ['elonmusk', 'nasa', 'openai', 'billgates', 'non_existent_twitter_handle_99', 'google']
  },
  telegram: {
    name: 'Telegram',
    tag: 'TG Direct',
    description: 'Check Telegram username availability, public channels & bot existence',
    placeholder: 'Paste Telegram usernames or links (e.g. durov, telegram, https://t.me/telegram)',
    sample: ['durov', 'telegram', 'notfound_random_user_9981273', 'crypto_hub', 'techcrunch']
  },
  github: {
    name: 'GitHub',
    tag: 'GH API',
    description: 'Probe GitHub developers, organizations and repository owners via REST API',
    placeholder: 'Paste GitHub usernames or URLs (e.g. https://github.com/torvalds, gaearon)',
    sample: ['torvalds', 'gaearon', 'sindresorhus', 'fake_gh_user_not_exist_9921']
  },
  gmail: {
    name: 'Gmail',
    tag: 'Google MX',
    description: 'Verify Gmail syntax and Google Workspace MX mailbox routability',
    placeholder: 'Paste Gmail mailboxes (e.g. user@gmail.com or username)',
    sample: ['google@gmail.com', 'support@gmail.com', 'usmanchandio079@gmail.com', 'help@gmail.com']
  },
  meta: {
    name: 'Meta',
    tag: 'Meta ID',
    description: 'Cross-platform Meta ecosystem identity and business identifier probe',
    placeholder: 'Paste Meta user IDs, usernames, or handles (e.g. meta, zuck, boz)',
    sample: ['meta', 'zuck', 'boz', 'yannlecun', 'clegg']
  }
};
