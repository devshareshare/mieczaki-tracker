import { beforeEach, describe, expect, it } from "vitest";
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
      avatar: "/avatars/pamelka_mieczaki.jpg",
      instagramUrl: "https://www.instagram.com/pamelka_mieczaki/",
    },
    {
      id: "filip_mieczaki",
      name: "Filip Wrzosek",
      handle: "filip_mieczaki",
      followers: 25000,
      posts: 120,
      avatar: "/avatars/filip_mieczaki.jpg",
      instagramUrl: "https://www.instagram.com/filip_mieczaki/",
    },
    {
      id: "patrycja_mieczaki",
      name: "Patrycja Bochyńska",
      handle: "patrycja_mieczaki",
      followers: 3684,
      posts: 28,
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
      },
      {
        handle: "filip_mieczaki",
        followers: 20000,
        posts: 100,
      },
      {
        handle: "patrycja_mieczaki",
        followers: 2000,
        posts: 20,
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
      },
      {
        handle: "filip_mieczaki",
        followers: 23000,
        posts: 110,
      },
      {
        handle: "patrycja_mieczaki",
        followers: 3000,
        posts: 25,
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

describe("Charts Component", () => {
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

  describe("Charts Component", () => {
    it("renders trajectory chart container and range filter buttons", () => {
      const chartsSection = createCharts(mockHistory, mockLatest);
      document.body.appendChild(chartsSection);

      const trajectoryCanvas = chartsSection.querySelector(
        "#growth-trajectory-chart",
      );

      expect(trajectoryCanvas).not.toBeNull();

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
