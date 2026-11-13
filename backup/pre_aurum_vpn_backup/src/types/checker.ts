export type SocialPlatform =
  | 'auto'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'twitter'
  | 'github'
  | 'facebook'
  | 'threads'
  | 'telegram'
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

export interface BatchHistory {
  id: string;
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

export interface UserWallet {
  balance: number;
  totalDeposited: number;
  totalSpent: number;
  totalChecks: number;
}

export interface PlatformConfig {
  id: SocialPlatform;
  name: string;
  iconName: string;
  placeholder: string;
  sampleInput: string[];
  color: string;
  badgeBg: string;
  accentBorder: string;
}

export const PLATFORMS_CONFIG: Record<SocialPlatform, PlatformConfig> = {
  auto: {
    id: 'auto',
    name: 'Auto-Detect',
    iconName: 'Zap',
    placeholder: 'Enter any profile URL, channel link, or handle (e.g. https://x.com/elonmusk, https://www.tiktok.com/@tiktok, https://www.youtube.com/@MrBeast, blushangel_8, torvalds)',
    sampleInput: [
      'https://x.com/elonmusk',
      'https://www.tiktok.com/@khaby.lame',
      'https://www.youtube.com/@MrBeast',
      'https://github.com/torvalds',
      'https://www.instagram.com/blushangel_8',
      'usmanchandio079@gmail.com'
    ],
    color: 'from-amber-400 via-orange-500 to-rose-500',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    accentBorder: 'border-amber-500/40'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    iconName: 'Instagram',
    placeholder: 'Enter Instagram handles (e.g. cristiano, leomessi, brand_name)',
    sampleInput: [
      'cristiano',
      'leomessi',
      'selenagomez',
      'mrbeast',
      'invalid_user_not_found_99381',
      'banned_spammer_account_test',
      'natgeo',
      'nike'
    ],
    color: 'from-pink-500 via-rose-500 to-amber-500',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    accentBorder: 'border-pink-500/40'
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    iconName: 'Youtube',
    placeholder: 'Enter YouTube channel handles or links (e.g. @MrBeast, mkbhd)',
    sampleInput: [
      'MrBeast',
      'mkbhd',
      'verge',
      'TED',
      'non_existent_channel_889218'
    ],
    color: 'from-red-600 to-rose-700',
    badgeBg: 'bg-red-500/10 text-red-400 border-red-500/20',
    accentBorder: 'border-red-500/40'
  },
  github: {
    id: 'github',
    name: 'GitHub',
    iconName: 'Github',
    placeholder: 'Enter GitHub usernames or URLs (e.g. torvalds, gaearon)',
    sampleInput: [
      'torvalds',
      'gaearon',
      'sindresorhus',
      'fake_gh_user_not_exist_9921'
    ],
    color: 'from-slate-400 to-slate-200',
    badgeBg: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    accentBorder: 'border-slate-500/40'
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    iconName: 'Twitter',
    placeholder: 'Enter X/Twitter handles (e.g. elonmusk, nasa, openai)',
    sampleInput: [
      'elonmusk',
      'nasa',
      'openai',
      'billgates',
      'non_existent_twitter_handle_99',
      'suspended_account_bot_demo',
      'google',
      'netflix'
    ],
    color: 'from-sky-400 to-blue-600',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    accentBorder: 'border-sky-500/40'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    iconName: 'Facebook',
    placeholder: 'Enter Facebook page usernames or user IDs (e.g. Meta, zuck)',
    sampleInput: [
      'Meta',
      'zuck',
      'Google',
      'SamsungGlobal',
      'deleted_page_nonexistent_882',
      'disabled_policy_violator_fb',
      'bbcnews'
    ],
    color: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    accentBorder: 'border-blue-500/40'
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    iconName: 'Video',
    placeholder: 'Enter TikTok usernames (e.g. khaby.lame, charlidamelio)',
    sampleInput: [
      'khaby.lame',
      'charlidamelio',
      'bellapoarch',
      'mrbeast',
      'tiktok_user_not_found_random88',
      'banned_community_guidelines_99',
      'zachking'
    ],
    color: 'from-cyan-400 via-teal-500 to-rose-500',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    accentBorder: 'border-cyan-500/40'
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    iconName: 'AtSign',
    placeholder: 'Enter Threads handles (e.g. zuck, mrbeast, verge)',
    sampleInput: [
      'zuck',
      'mrbeast',
      'verge',
      'mkbhd',
      'threads_ghost_account_404',
      'threads_suspended_account_demo',
      'mosseri'
    ],
    color: 'from-purple-500 to-pink-600',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    accentBorder: 'border-purple-500/40'
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    iconName: 'Send',
    placeholder: 'Enter Telegram channels or usernames (e.g. durov, telegram, bbcnews)',
    sampleInput: [
      'durov',
      'telegram',
      'CryptoNews',
      'non_existent_tg_user_9921'
    ],
    color: 'from-sky-400 via-blue-500 to-indigo-600',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    accentBorder: 'border-sky-500/40'
  },
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    iconName: 'Mail',
    placeholder: 'Enter Gmail addresses (e.g. alex@gmail.com or username)',
    sampleInput: [
      'google@gmail.com',
      'support@gmail.com',
      'usmanalikhanchandio@gmail.com',
      'help@gmail.com',
      'definitely_fake_account_998822@gmail.com',
      'suspended_violator_test@gmail.com',
      'admin@gmail.com'
    ],
    color: 'from-red-500 via-amber-500 to-emerald-500',
    badgeBg: 'bg-red-500/10 text-red-400 border-red-500/20',
    accentBorder: 'border-red-500/40'
  },
  meta: {
    id: 'meta',
    name: 'Meta',
    iconName: 'Infinity',
    placeholder: 'Enter Meta user IDs, usernames, or handles (e.g. meta, zuck, boz)',
    sampleInput: [
      'meta',
      'zuck',
      'boz',
      'yannlecun',
      'clegg',
      'nonexistent_meta_id_8892',
      'suspended_meta_violator_demo',
      'metaai'
    ],
    color: 'from-blue-600 via-indigo-600 to-cyan-500',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    accentBorder: 'border-indigo-500/40'
  }
};

export const PRICING = {
  liveness: 0.0025,
  details: 0.0035
} as const;
