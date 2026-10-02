import type {
  Contestant,
  HistorySnapshot,
  LatestSnapshot,
  MilestoneProgress,
} from "../types/data";

const TARGET_GOAL = 100000;

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
