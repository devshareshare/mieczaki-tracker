export interface Contestant {
  id: string;
  name: string;
  handle: string;
  followers: number;
  posts: number;
  comments: number;
  avatar: string;
  instagramUrl: string;
}

export interface LatestSnapshot {
  timestamp: string;
  contestants: Contestant[];
}

export interface HistorySnapshot {
  timestamp: string;
  contestants: Array<{
    handle: string;
    followers: number;
    posts: number;
    comments?: number;
  }>;
}

export interface Badges {
  topWeeklyGainer?: { handle: string; gained: number };
  fastestPercentageGrowth?: { handle: string; percent: number };
  mostActivePoster?: { handle: string; posts: number };
  mostDiscussedPoster?: { handle: string; comments: number };
}

export interface MilestoneProgress {
  current: number;
  target: number;
  percent: number;
}

export type MonthlyStats = Array<{
  month: string;
  followersGained: Record<string, number>;
  postsPublished: Record<string, number>;
  commentsGained: Record<string, number>;
}>;
