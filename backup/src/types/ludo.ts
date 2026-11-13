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

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  isGuest: boolean;
  email?: string;
  stats: PlayerStats;
  lastDailyBonusAt?: string;
  lastAdWatchedAt?: string;
  isBanned?: boolean;
  createdAt: string;
}

export interface CoinTransaction {
  id: string;
  playerId: string;
  type: 'STARTING_BONUS' | 'DAILY_BONUS' | 'REWARDED_AD' | 'MATCH_WIN' | 'MATCH_REWARD' | 'ADMIN_ADJUSTMENT';
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
