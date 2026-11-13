export type SocialPlatform = 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'gmail';

export type AccountStatus =
  | 'LIVE'
  | 'SUSPENDED'
  | 'NOT_FOUND'
  | 'UNVERIFIED'
  | 'PRIVATE'
  | 'UNKNOWN'       // backward-compatibility alias for UNVERIFIED
  | 'ERROR'         // alias for UNVERIFIED
  | 'BANNED'        // backward-compatibility alias for SUSPENDED
  | 'AVAILABLE'     // backward-compatibility alias for LIVE
  | 'UNAVAILABLE';  // backward-compatibility alias for NOT_FOUND

export type ResultCategory =
  | 'ALL'
  | 'LIVE'
  | 'SUSPENDED'
  | 'NOT_FOUND'
  | 'UNVERIFIED'
  | 'PRIVATE'
  | 'LIVE_AND_BANNED';

export type TargetType = 'profile' | 'page' | 'channel' | 'video';

export interface AccountCheckResult {
  id: string;
  platform: SocialPlatform;
  rawInput: string;
  username: string;
  profileUrl: string;
  targetType: TargetType;
  status: AccountStatus;
  checkedAt: string;
  details: string;
  statusCode?: number;
  metadata?: {
    title?: string;
    authorName?: string;
    thumbnailUrl?: string;
    followerCount?: number;
    isVerified?: boolean;
    isPrivate?: boolean;
  };
}

export interface CheckRequestItem {
  id?: string;
  platform: SocialPlatform;
  input: string;
}

export interface BulkCheckSummary {
  total: number;
  live: number;
  suspended: number;
  notFound: number;
  unverified: number;
  private: number;
  unknown?: number;
  error?: number;
}

export interface BulkCheckResponse {
  results: AccountCheckResult[];
  summary: BulkCheckSummary;
}
