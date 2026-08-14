import { describe, expect, it } from "vitest";
import {
  getBadges,
  getGrowthChartData,
  getMilestoneProgress,
  getMonthlyStats,
  getRankedContestants,
} from "../src/services/dataService";
import type { HistorySnapshot, LatestSnapshot } from "../src/types/data";

const mockLatest: LatestSnapshot = {
  timestamp: "2026-08-05T00:00:00.000Z",
  contestants: [
    {
      id: "filip_mieczaki",
      name: "Filip Wrzosek",
      handle: "filip_mieczaki",
      followers: 25000,
      posts: 120,
      comments: 3200,
      avatar: "/avatars/filip_mieczaki.jpg",
      instagramUrl: "https://www.instagram.com/filip_mieczaki/",
    },
    {
      id: "pamelka_mieczaki",
      name: "Pamela Kiedrowicz",
      handle: "pamelka_mieczaki",
      followers: 33000,
      posts: 145,
      comments: 4800,
      avatar: "/avatars/pamelka_mieczaki.jpg",
      instagramUrl: "https://www.instagram.com/pamelka_mieczaki/",
    },
    {
      id: "patrycja_mieczaki",
      name: "Patrycja Bochyńska",
      handle: "patrycja_mieczaki",
      followers: 3684,
      posts: 28,
      comments: 650,
      avatar: "/avatars/patrycja_mieczaki.jpg",
      instagramUrl: "https://www.instagram.com/patrycja_mieczaki/",
    },
  ],
};

const mockHistory: HistorySnapshot[] = [
  {
    timestamp: "2026-07-01T00:00:00.000Z",
    contestants: [
      {
        handle: "pamelka_mieczaki",
        followers: 29000,
        posts: 130,
        comments: 4000,
      },
      {
        handle: "filip_mieczaki",
        followers: 20000,
        posts: 100,
        comments: 2500,
      },
      {
        handle: "patrycja_mieczaki",
        followers: 2000,
        posts: 20,
        comments: 400,
      },
    ],
  },
  {
    timestamp: "2026-07-29T00:00:00.000Z", // 7 days before latest
    contestants: [
      {
        handle: "pamelka_mieczaki",
        followers: 31500,
        posts: 140,
        comments: 4500,
      },
      {
        handle: "filip_mieczaki",
        followers: 23000,
        posts: 110,
        comments: 2800,
      },
      {
        handle: "patrycja_mieczaki",
        followers: 3000,
        posts: 25,
        comments: 550,
      },
    ],
  },
  {
    timestamp: "2026-08-05T00:00:00.000Z",
    contestants: [
      {
        handle: "pamelka_mieczaki",
        followers: 33000,
        posts: 145,
        comments: 4800,
      },
      {
        handle: "filip_mieczaki",
        followers: 25000,
        posts: 120,
        comments: 3200,
      },
      {
        handle: "patrycja_mieczaki",
        followers: 3684,
        posts: 28,
        comments: 650,
      },
    ],
  },
];

describe("dataService", () => {
  describe("getRankedContestants", () => {
    it("sorts contestants by followers in descending order", () => {
      const ranked = getRankedContestants(mockLatest);
      expect(ranked).toHaveLength(3);
      expect(ranked[0].handle).toBe("pamelka_mieczaki");
      expect(ranked[1].handle).toBe("filip_mieczaki");
      expect(ranked[2].handle).toBe("patrycja_mieczaki");
    });

    it("returns empty array for invalid input", () => {
      expect(getRankedContestants(null as unknown as LatestSnapshot)).toEqual(
        [],
      );
    });
  });

  describe("getMilestoneProgress", () => {
    it("calculates correct milestone progress for 3684 followers", () => {
      const progress = getMilestoneProgress(3684);
      expect(progress.current).toBe(3684);
      expect(progress.target).toBe(50000);
      expect(progress.percent).toBe(7.4);
    });

    it("calculates correct milestone progress for 33000 followers", () => {
      const progress = getMilestoneProgress(33000);
      expect(progress.current).toBe(33000);
      expect(progress.target).toBe(50000);
      expect(progress.percent).toBe(66);
    });

    it("handles 0 followers", () => {
      const progress = getMilestoneProgress(0);
      expect(progress.current).toBe(0);
      expect(progress.target).toBe(50000);
      expect(progress.percent).toBe(0);
    });
  });

  describe("getBadges", () => {
    it("calculates badges correctly from 7-day history window", () => {
      const badges = getBadges(mockLatest, mockHistory);

      expect(badges.topWeeklyGainer).toEqual({
        handle: "filip_mieczaki",
        gained: 2000,
      });

      expect(badges.fastestPercentageGrowth).toEqual({
        handle: "patrycja_mieczaki",
        percent: 22.8,
      });

      expect(badges.mostActivePoster).toEqual({
        handle: "filip_mieczaki",
        posts: 10,
      });

      expect(badges.mostDiscussedPoster).toEqual({
        handle: "filip_mieczaki",
        comments: 400,
      });
    });

    it("handles empty history gracefully", () => {
      const badges = getBadges(mockLatest, []);
      expect(badges.topWeeklyGainer).toBeUndefined();
      expect(badges.fastestPercentageGrowth).toBeUndefined();
      expect(badges.mostActivePoster).toEqual({
        handle: "pamelka_mieczaki",
        posts: 145,
      });
    });

    it("does not award weekly badges from lifetime totals when weekly gain is zero", () => {
      const latest: LatestSnapshot = {
        timestamp: "2026-08-05T00:00:00.000Z",
        contestants: [
          {
            id: "a",
            name: "A",
            handle: "a",
            followers: 10000,
            posts: 80,
            comments: 500,
            avatar: "",
            instagramUrl: "",
          },
          {
            id: "b",
            name: "B",
            handle: "b",
            followers: 10000,
            posts: 20,
            comments: 200,
            avatar: "",
            instagramUrl: "",
          },
        ],
      };
      const history: HistorySnapshot[] = [
        {
          timestamp: "2026-07-29T00:00:00.000Z",
          contestants: [
            { handle: "a", followers: 10000, posts: 80, comments: 500 },
            { handle: "b", followers: 10000, posts: 15, comments: 150 },
          ],
        },
      ];

      const badges = getBadges(latest, history);

      // "a" has 0 weekly post gain despite 80 lifetime posts; "b" gained 5.
      expect(badges.mostActivePoster).toEqual({ handle: "b", posts: 5 });
      expect(badges.mostDiscussedPoster).toEqual({ handle: "b", comments: 50 });
    });
  });

  describe("getGrowthChartData", () => {
    it("formats history into chart labels and datasets", () => {
      const chartData = getGrowthChartData(mockHistory);
      expect(chartData.labels).toEqual([
        "2026-07-01",
        "2026-07-29",
        "2026-08-05",
      ]);
      expect(chartData.datasets).toHaveLength(3);

      const pamelkaDataset = chartData.datasets.find(
        (d) => d.handle === "pamelka_mieczaki",
      );
      expect(pamelkaDataset).toBeDefined();
      expect(pamelkaDataset?.data).toEqual([29000, 31500, 33000]);
    });

    it("handles empty history", () => {
      expect(getGrowthChartData([])).toEqual({ labels: [], datasets: [] });
    });
  });

  describe("getMonthlyStats", () => {
    it("aggregates stats by month", () => {
      const monthly = getMonthlyStats(mockHistory);
      expect(monthly).toHaveLength(2);

      expect(monthly[0].month).toBe("2026-07");
      expect(monthly[0].followersGained.pamelka_mieczaki).toBe(2500);
      expect(monthly[0].postsPublished.pamelka_mieczaki).toBe(10);
      expect(monthly[0].commentsGained.pamelka_mieczaki).toBe(500);

      expect(monthly[1].month).toBe("2026-08");
      expect(monthly[1].followersGained.pamelka_mieczaki).toBe(1500);
      expect(monthly[1].postsPublished.pamelka_mieczaki).toBe(5);
      expect(monthly[1].commentsGained.pamelka_mieczaki).toBe(300);
    });

    it("handles empty history", () => {
      expect(getMonthlyStats([])).toEqual([]);
    });
  });
});
