import { beforeEach, describe, expect, it } from "vitest";
import { createBadges } from "../src/components/Badges";
import { createCharts } from "../src/components/Charts";
import type { HistorySnapshot, LatestSnapshot } from "../src/types/data";

const mockLatest: LatestSnapshot = {
  timestamp: "2026-08-05T00:00:00.000Z",
  contestants: [
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
    timestamp: "2026-07-29T00:00:00.000Z",
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
      { handle: "pamelka_mieczaki", followers: 33000, posts: 145 },
      { handle: "filip_mieczaki", followers: 25000, posts: 120 },
      { handle: "patrycja_mieczaki", followers: 3684, posts: 28 },
    ],
  },
];

describe("Badges and Charts Components", () => {
  beforeEach(() => {
    document.body.innerHTML = "";

    if (typeof window !== "undefined") {
      window.getComputedStyle = () =>
        ({
          getPropertyValue: () => "",
        }) as unknown as CSSStyleDeclaration;
    }

    if (typeof globalThis.ResizeObserver === "undefined") {
      globalThis.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }

    if (typeof HTMLCanvasElement !== "undefined") {
      // @ts-expect-error - Canvas context mock for JSDOM
      HTMLCanvasElement.prototype.getContext = function () {
        return {
          canvas: this,
          fillRect: () => {},
          clearRect: () => {},
          getImageData: () => ({ data: [] }),
          putImageData: () => {},
          createImageData: () => ({}),
          setTransform: () => {},
          resetTransform: () => {},
          drawFocusIfNeeded: () => {},
          save: () => {},
          fill: () => {},
          restore: () => {},
          beginPath: () => {},
          closePath: () => {},
          stroke: () => {},
          translate: () => {},
          scale: () => {},
          rotate: () => {},
          arc: () => {},
          arcTo: () => {},
          measureText: () => ({ width: 0 }),
          transform: () => {},
          rect: () => {},
          clip: () => {},
          setLineDash: () => {},
          getLineDash: () => [],
          createLinearGradient: () => ({ addColorStop: () => {} }),
          createPattern: () => ({}),
        } as unknown as CanvasRenderingContext2D;
      };
    }
  });

  describe("Badges Component", () => {
    it("renders cards for Top Weekly Gainer, Fastest % Growth, and Most Active Poster", () => {
      const badgesSection = createBadges(mockLatest, mockHistory);
      document.body.appendChild(badgesSection);

      const gainerCard = badgesSection.querySelector(
        '[data-badge-type="top-weekly-gainer"]',
      );
      const growthCard = badgesSection.querySelector(
        '[data-badge-type="fastest-percentage-growth"]',
      );
      const posterCard = badgesSection.querySelector(
        '[data-badge-type="most-active-poster"]',
      );
      const discussedCard = badgesSection.querySelector(
        '[data-badge-type="most-discussed-poster"]',
      );

      expect(gainerCard).not.toBeNull();
      expect(growthCard).not.toBeNull();
      expect(posterCard).not.toBeNull();
      expect(discussedCard).not.toBeNull();

      expect(gainerCard?.textContent).toContain("Top Weekly Gainer");
      expect(growthCard?.textContent).toContain("Fastest Weekly % Growth");
      expect(posterCard?.textContent).toContain("Most Active Weekly Poster");
      expect(discussedCard?.textContent).toContain(
        "Most Discussed Weekly Poster",
      );

      expect(gainerCard?.textContent).toContain("Filip Wrzosek");
      expect(
        gainerCard?.querySelector('[data-testid="badge-metric"]')?.textContent,
      ).toBe("+2,000 obserwujących");

      expect(growthCard?.textContent).toContain("Patrycja Bochyńska");
      expect(
        growthCard?.querySelector('[data-testid="badge-metric"]')?.textContent,
      ).toBe("+22.8%");

      expect(posterCard?.textContent).toContain("Filip Wrzosek");
      expect(
        posterCard?.querySelector('[data-testid="badge-metric"]')?.textContent,
      ).toBe("10 postów");

      expect(discussedCard?.textContent).toContain("Filip Wrzosek");
      expect(
        discussedCard?.querySelector('[data-testid="badge-metric"]')
          ?.textContent,
      ).toBe("400 komentarzy");
    });

    it("handles empty history gracefully", () => {
      const badgesSection = createBadges(mockLatest, []);
      document.body.appendChild(badgesSection);

      const gainerCard = badgesSection.querySelector(
        '[data-badge-type="top-weekly-gainer"]',
      );
      const metric = gainerCard?.querySelector('[data-testid="badge-metric"]');
      expect(metric?.textContent).toBe("Brak danych");
    });
  });

  describe("Charts Component", () => {
    it("renders chart containers and canvas elements for trajectory and monthly stats", () => {
      const chartsSection = createCharts(mockHistory, mockLatest);
      document.body.appendChild(chartsSection);

      const trajectoryCanvas = chartsSection.querySelector(
        "#growth-trajectory-chart",
      );
      const followersCanvas = chartsSection.querySelector(
        "#monthly-followers-chart",
      );
      const postsCanvas = chartsSection.querySelector("#monthly-posts-chart");

      expect(trajectoryCanvas).not.toBeNull();
      expect(followersCanvas).not.toBeNull();
      expect(postsCanvas).not.toBeNull();

      const rangeBtns = chartsSection.querySelectorAll(
        "#range-controls .filter-btn",
      );
      expect(rangeBtns.length).toBe(3);
    });

    it("handles empty history without throwing errors", () => {
      expect(() => {
        const chartsSection = createCharts([], mockLatest);
        document.body.appendChild(chartsSection);
      }).not.toThrow();
    });
  });
});
