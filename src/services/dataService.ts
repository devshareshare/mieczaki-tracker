import type {
  Badges,
  Contestant,
  HistorySnapshot,
  LatestSnapshot,
  MilestoneProgress,
  MonthlyStats,
} from "../types/data";

const TARGET_GOAL = 50000;

export interface GrowthChartDataset {
  handle: string;
  label: string;
  data: number[];
}

export interface GrowthChartData {
  labels: string[];
  datasets: GrowthChartDataset[];
}

export function getRankedContestants(latest: LatestSnapshot): Contestant[] {
  if (!latest || !Array.isArray(latest.contestants)) {
    return [];
  }
  return [...latest.contestants].sort((a, b) => {
    if (b.followers !== a.followers) {
      return b.followers - a.followers;
    }
    return a.name.localeCompare(b.name);
  });
}

export function getMilestoneProgress(followers: number): MilestoneProgress {
  const current = Math.max(0, followers);
  const target = TARGET_GOAL;
  const rawPercent = (current / target) * 100;
  const percent = Math.min(100, Math.max(0, Number(rawPercent.toFixed(1))));

  return {
    current,
    target,
    percent,
  };
}

export function getBadges(
  latest: LatestSnapshot,
  history: HistorySnapshot[],
): Badges {
  if (
    !latest ||
    !Array.isArray(latest.contestants) ||
    latest.contestants.length === 0
  ) {
    return {};
  }

  if (!history || history.length === 0) {
    let mostActive: { handle: string; posts: number } | undefined;
    for (const c of latest.contestants) {
      if (!mostActive || c.posts > mostActive.posts) {
        mostActive = { handle: c.handle, posts: c.posts };
      }
    }
    return {
      mostActivePoster: mostActive,
    };
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const latestTime = new Date(latest.timestamp).getTime();
  const targetTime = latestTime - 7 * 24 * 60 * 60 * 1000;

  let pastSnapshot = sortedHistory[0];
  let minDiff = Math.abs(
    new Date(pastSnapshot.timestamp).getTime() - targetTime,
  );

  for (const snap of sortedHistory) {
    const snapTime = new Date(snap.timestamp).getTime();
    if (snapTime <= latestTime) {
      const diff = Math.abs(snapTime - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        pastSnapshot = snap;
      }
    }
  }

  let topGainer: { handle: string; gained: number } | undefined;
  let fastestGrowth: { handle: string; percent: number } | undefined;
  let mostActive: { handle: string; posts: number } | undefined;

  for (const c of latest.contestants) {
    const pastEntry = pastSnapshot.contestants.find(
      (p) => p.handle === c.handle,
    );
    const pastFollowers = pastEntry ? pastEntry.followers : c.followers;
    const pastPosts = pastEntry ? pastEntry.posts : c.posts;

    const gained = c.followers - pastFollowers;
    const percent =
      pastFollowers > 0
        ? Number(
            (((c.followers - pastFollowers) / pastFollowers) * 100).toFixed(2),
          )
        : 0;
    const postsGained = c.posts - pastPosts;

    if (gained > 0 && (!topGainer || gained > topGainer.gained)) {
      topGainer = { handle: c.handle, gained };
    }

    if (percent > 0 && (!fastestGrowth || percent > fastestGrowth.percent)) {
      fastestGrowth = { handle: c.handle, percent };
    }

    if (postsGained > 0 && (!mostActive || postsGained > mostActive.posts)) {
      mostActive = { handle: c.handle, posts: postsGained };
    }
  }

  return {
    topWeeklyGainer: topGainer,
    fastestPercentageGrowth: fastestGrowth,
    mostActivePoster: mostActive,
  };
}

export function getGrowthChartData(
  history: HistorySnapshot[],
): GrowthChartData {
  if (!history || history.length === 0) {
    return { labels: [], datasets: [] };
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const labels = sortedHistory.map((snapshot) => {
    const d = new Date(snapshot.timestamp);
    return d.toISOString().split("T")[0];
  });

  const handles = new Set<string>();
  for (const snapshot of sortedHistory) {
    for (const c of snapshot.contestants) {
      handles.add(c.handle);
    }
  }

  const datasets: GrowthChartDataset[] = Array.from(handles).map((handle) => {
    const data = sortedHistory.map((snapshot) => {
      const contestant = snapshot.contestants.find((c) => c.handle === handle);
      return contestant ? contestant.followers : 0;
    });

    return {
      handle,
      label: `@${handle}`,
      data,
    };
  });

  return { labels, datasets };
}

export function getMonthlyStats(history: HistorySnapshot[]): MonthlyStats {
  if (!history || history.length === 0) {
    return [];
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const monthGroups = new Map<string, HistorySnapshot[]>();
  for (const snapshot of sortedHistory) {
    const monthKey = snapshot.timestamp.slice(0, 7);
    let monthList = monthGroups.get(monthKey);
    if (!monthList) {
      monthList = [];
      monthGroups.set(monthKey, monthList);
    }
    monthList.push(snapshot);
  }

  const sortedMonthKeys = Array.from(monthGroups.keys()).sort();
  const result: MonthlyStats = [];

  let lastSnapshotOfPreviousMonth: HistorySnapshot | null = null;

  for (const monthKey of sortedMonthKeys) {
    const snapshotsInMonth = monthGroups.get(monthKey) ?? [];
    if (snapshotsInMonth.length === 0) continue;

    const startSnapshot = lastSnapshotOfPreviousMonth ?? snapshotsInMonth[0];
    const endSnapshot = snapshotsInMonth[snapshotsInMonth.length - 1];

    const followersGained: Record<string, number> = {};
    const postsPublished: Record<string, number> = {};
    const commentsGained: Record<string, number> = {};

    const handles = new Set<string>([
      ...startSnapshot.contestants.map((c) => c.handle),
      ...endSnapshot.contestants.map((c) => c.handle),
    ]);

    for (const handle of handles) {
      const startEntry = startSnapshot.contestants.find(
        (c) => c.handle === handle,
      );
      const endEntry = endSnapshot.contestants.find((c) => c.handle === handle);

      const startFollowers = startEntry ? startEntry.followers : 0;
      const endFollowers = endEntry ? endEntry.followers : 0;
      const startPosts = startEntry ? startEntry.posts : 0;
      const endPosts = endEntry ? endEntry.posts : 0;
      const startComments =
        startEntry && startEntry.comments !== undefined
          ? startEntry.comments
          : 0;
      const endComments =
        endEntry && endEntry.comments !== undefined ? endEntry.comments : 0;

      followersGained[handle] = Math.max(0, endFollowers - startFollowers);
      postsPublished[handle] = Math.max(0, endPosts - startPosts);
      commentsGained[handle] = Math.max(0, endComments - startComments);
    }

    result.push({
      month: monthKey,
      followersGained,
      postsPublished,
      commentsGained,
    });

    lastSnapshotOfPreviousMonth = endSnapshot;
  }

  return result;
}
