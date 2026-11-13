export type LudoColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export type TokenState = 'YARD' | 'TRACK' | 'HOMERUN' | 'HOME';

export interface Token {
  id: number; // 0, 1, 2, 3
  color: LudoColor;
  state: TokenState;
  trackPos: number; // 0..51 when on track, 1..5 in homerun, 6 when home, -1 in yard
  stepCount: number; // 0 = yard, 1 = start cell, 51 = before home path, 52..56 = home run, 57 = home
}

export interface PlayerStats {
  matchesPlayed: number;
  wins: number;
  twoPlayerWins: number;
  fourPlayerWins: number;
  tokensCaptured: number;
  coinsEarned: number;
}

export interface PlayerInventory {
  diceSkins: string[]; // e.g. ['classic_gold', 'emerald_sultan', 'ruby_imperial', 'cyber_obsidian']
  tokenSkins: string[]; // e.g. ['imperial_crown', 'golden_falcon', 'ottoman_tughra', 'jewel_ruby']
  boardThemes: string[]; // e.g. ['royal_midnight', 'emerald_palace', 'ottoman_crimson', 'obsidian_velvet']
  avatars: string[];
  equippedDice: string;
  equippedToken: string;
  equippedBoard: string;
  equippedAvatar: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  xp: number;
  level: number;
  isGuest: boolean;
  email?: string;
  stats: PlayerStats;
  inventory: PlayerInventory;
  dailyStreak: number; // 0..7
  lastDailyBonusAt?: string;
  lastDailyCalendarClaimAt?: string;
  lastSpinAt?: string;
  lastAdWatchedAt?: string;
  binanceUid?: string;
  binanceClaimedAt?: string;
  isBanned?: boolean;
  createdAt: string;
}

export interface CoinTransaction {
  id: string;
  playerId: string;
  type:
    | 'STARTING_BONUS'
    | 'DAILY_BONUS'
    | 'DAILY_CALENDAR'
    | 'LUCKY_SPIN'
    | 'REWARDED_AD'
    | 'MATCH_WIN'
    | 'MATCH_REWARD'
    | 'SHOP_PURCHASE'
    | 'TOURNAMENT_ENTRY'
    | 'TOURNAMENT_PRIZE'
    | 'BINANCE_REFERRAL_BONUS'
    | 'ADMIN_ADJUSTMENT';
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
}

export type GameMode = '2_PLAYER' | '4_PLAYER' | 'PRIVATE_ROOM' | 'VS_BOT';

export type RoomStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';

export interface TokenStepInfo {
  state: TokenState;
  trackPos: number;
  stepCount: number;
}

export interface MovingAnimationState {
  color: LudoColor;
  tokenId: number;
  path: TokenStepInfo[];
  stepIndex: number;
}

export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  color: LudoColor;
  isReady: boolean;
  isConnected: boolean;
  isBot?: boolean;
  finishRank?: number;
  isSpeaking?: boolean;
  isMuted?: boolean;
  equippedDice?: string;
  equippedToken?: string;
}

export interface GameState {
  roomId: string;
  roomCode: string;
  mode: GameMode;
  status: RoomStatus;
  maxPlayers: 2 | 4;
  players: RoomPlayer[];
  currentTurnColor: LudoColor;
  diceValue: number | null;
  hasRolled: boolean;
  sixCount: number;
  turnTimeLeft: number;
  tokens: Record<LudoColor, Token[]>;
  movableTokens: number[];
  winners: { playerId: string; color: LudoColor; rank: number }[];
  isMoving?: boolean;
  movingAnimation?: MovingAnimationState | null;
  lastAction?: string;
  boardTheme?: string;
  createdAt: string;
}

export interface LudoSettings {
  startingCoins: number;
  dailyBonusCoins: number;
  rewardedAdCoins: number;
  turnTimeoutSeconds: number;
  minAdCooldownSeconds: number;
  adminPassword?: string;
}

export type AppLanguage = 'en' | 'ur';

// ==========================================
// IMAGE 2: Daily Check-In & Spin Wheel
// ==========================================
export interface CalendarDayReward {
  day: number;
  coins: number;
  specialItem?: string;
  claimed: boolean;
  isCurrent: boolean;
}

export interface SpinWheelPrize {
  id: string;
  label: string;
  coins: number;
  color: string;
  textColor: string;
  probability: number;
  isJackpot?: boolean;
}

// ==========================================
// IMAGE 3: Leaderboard & Rankings
// ==========================================
export type RankTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' | 'SULTAN_GRANDMASTER';

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  name: string;
  avatar: string;
  tier: RankTier;
  coins: number;
  wins: number;
  matchesPlayed: number;
  winRate: number;
  xp: number;
  level: number;
}

// ==========================================
// IMAGE 4: Cosmetic Shop & Items
// ==========================================
export type CosmeticCategory = 'DICE' | 'TOKEN' | 'BOARD' | 'AVATAR';

export interface CosmeticItem {
  id: string;
  name: string;
  category: CosmeticCategory;
  priceCoins: number;
  description: string;
  previewColor: string;
  accentColor: string;
  iconName: string;
  badge?: string;
}

// ==========================================
// IMAGE 6: Voice Chat & Quick Reactions
// ==========================================
export interface VoicePeerState {
  playerId: string;
  isMuted: boolean;
  isSpeaking: boolean;
  audioLevel: number; // 0..100
}

export interface EmojiReaction {
  id: string;
  sender: string;
  emoji: string;
  timestamp: number;
}

// ==========================================
// IMAGE 7: Tournaments & Knockout Brackets
// ==========================================
export interface TournamentPlayer {
  id: string;
  name: string;
  avatar: string;
  level: number;
}

export interface TournamentMatch {
  id: string;
  round: 'QUARTERS' | 'SEMIS' | 'FINALS';
  matchIndex: number;
  player1: TournamentPlayer | null;
  player2: TournamentPlayer | null;
  winnerId?: string;
  score1?: number;
  score2?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Tournament {
  id: string;
  title: string;
  entryFee: number;
  prizePool: number;
  status: 'REGISTRATION' | 'IN_PROGRESS' | 'COMPLETED';
  maxParticipants: 8;
  registeredPlayers: TournamentPlayer[];
  matches: TournamentMatch[];
  winner?: { id: string; name: string; avatar: string; prize: number };
  startsInSeconds: number;
}
