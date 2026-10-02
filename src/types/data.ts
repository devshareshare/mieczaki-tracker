export interface Contestant {
  id: string;
  name: string;
  handle: string;
  followers: number;
  posts: number;
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
  }>;
}

export interface MilestoneProgress {
  current: number;
  target: number;
  percent: number;
}
