import { beforeEach, describe, expect, it } from "vitest";
import { createHeader } from "../src/components/Header";
import { createPodium } from "../src/components/Podium";
import { createTileGrid } from "../src/components/TileGrid";
import { getRankedContestants } from "../src/services/dataService";
import type { Contestant, LatestSnapshot } from "../src/types/data";

const mockSnapshot: LatestSnapshot = {
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
      id: "pati_mieczaki",
      name: "Patrycja Tomaszewska",
      handle: "pati_mieczaki",
      followers: 23000,
      posts: 98,
      comments: 2100,
      avatar: "/avatars/pati_mieczaki.jpg",
      instagramUrl: "https://www.instagram.com/pati_mieczaki/",
    },
    {
      id: "maquk_mieczaki",
      name: "Dominik Makowiak",
      handle: "maquk_mieczaki",
      followers: 21000,
      posts: 110,
      comments: 1800,
      avatar: "/avatars/maquk_mieczaki.jpg",
      instagramUrl: "https://www.instagram.com/maquk_mieczaki/",
    },
    {
      id: "wiktor_mieczaki",
      name: "Wiktor Woroniak",
      handle: "wiktor_mieczaki",
      followers: 19000,
      posts: 92,
      comments: 1500,
      avatar: "/avatars/wiktor_mieczaki.jpg",
      instagramUrl: "https://www.instagram.com/wiktor_mieczaki/",
    },
  ],
};

describe("UI Components", () => {
  let contestants: Contestant[];

  beforeEach(() => {
    document.body.innerHTML = "";
    if (typeof window !== "undefined") {
      window.getComputedStyle = () =>
        ({
          getPropertyValue: () => "",
        }) as unknown as CSSStyleDeclaration;
    }
    contestants = getRankedContestants(mockSnapshot);
  });

  describe("Header Component", () => {
    it("renders centered title and show subtitle", () => {
      const header = createHeader(contestants);
      document.body.appendChild(header);

      const title = header.querySelector(".header-title");
      expect(title).not.toBeNull();
      expect(title?.textContent).toContain("MIĘCZAKI");
      expect(title?.textContent).toContain("TRACKER");

      const subtitle = header.querySelector(".header-subtitle");
      expect(subtitle).not.toBeNull();
      expect(subtitle?.textContent?.length).toBeGreaterThan(0);
    });

    it("handles empty contestant list gracefully", () => {
      const header = createHeader([]);
      document.body.appendChild(header);

      const title = header.querySelector(".header-title");
      expect(title?.textContent).toContain("MIĘCZAKI");
    });
  });

  describe("Podium Component", () => {
    it("renders top 3 contestants in Gold, Silver, and Bronze cards", () => {
      const podium = createPodium(contestants);
      document.body.appendChild(podium);

      const goldCard = podium.querySelector(".podium-card.gold");
      const silverCard = podium.querySelector(".podium-card.silver");
      const bronzeCard = podium.querySelector(".podium-card.bronze");

      expect(goldCard).not.toBeNull();
      expect(silverCard).not.toBeNull();
      expect(bronzeCard).not.toBeNull();

      // Gold = #1 (pamelka_mieczaki)
      expect(goldCard?.getAttribute("data-handle")).toBe("pamelka_mieczaki");
      expect(goldCard?.querySelector(".podium-rank-badge")?.textContent).toBe(
        "#1",
      );

      // Silver = #2 (filip_mieczaki)
      expect(silverCard?.getAttribute("data-handle")).toBe("filip_mieczaki");
      expect(silverCard?.querySelector(".podium-rank-badge")?.textContent).toBe(
        "#2",
      );

      // Bronze = #3 (pati_mieczaki)
      expect(bronzeCard?.getAttribute("data-handle")).toBe("pati_mieczaki");
      expect(bronzeCard?.querySelector(".podium-rank-badge")?.textContent).toBe(
        "#3",
      );
    });

    it("renders avatar image, follower count, post count, and instagram link for top 3", () => {
      const podium = createPodium(contestants);
      document.body.appendChild(podium);

      const goldCard = podium.querySelector(".podium-card.gold");
      const img = goldCard?.querySelector(
        "img.avatar-image",
      ) as HTMLImageElement;
      expect(img).not.toBeNull();
      expect(img.getAttribute("src")).toBe("./avatars/pamelka_mieczaki.jpg");

      const followers = goldCard?.querySelector(
        '[data-testid="followers-count"]',
      );
      expect(followers?.textContent).toBe("33,000");

      const posts = goldCard?.querySelector('[data-testid="posts-count"]');
      expect(posts?.textContent).toBe("145");

      const handleLink = goldCard?.querySelector(
        "a.contestant-handle",
      ) as HTMLAnchorElement;
      expect(handleLink.href).toBe(
        "https://www.instagram.com/pamelka_mieczaki/",
      );
    });

    it("handles fewer than 3 contestants gracefully", () => {
      const partial = contestants.slice(0, 1); // 1 contestant
      const podium = createPodium(partial);
      document.body.appendChild(podium);

      const goldCard = podium.querySelector(".podium-card.gold");
      const silverCard = podium.querySelector(".podium-card.silver");

      expect(goldCard).not.toBeNull();
      expect(silverCard).toBeNull();
    });
  });

  describe("TileGrid Component", () => {
    it("renders responsive grid cards for ranks 4 and below", () => {
      const grid = createTileGrid(contestants, 3);
      document.body.appendChild(grid);

      const cards = grid.querySelectorAll(".tile-card");
      expect(cards.length).toBe(2); // 5 contestants total minus 3 top = 2 grid cards

      const card4 = cards[0];
      expect(card4.getAttribute("data-rank")).toBe("4");
      expect(card4.getAttribute("data-handle")).toBe("maquk_mieczaki");

      const card5 = cards[1];
      expect(card5.getAttribute("data-rank")).toBe("5");
      expect(card5.getAttribute("data-handle")).toBe("wiktor_mieczaki");
    });

    it("displays avatar JPEG, follower count, post count, and progress bar to next milestone", () => {
      const grid = createTileGrid(contestants, 3);
      document.body.appendChild(grid);

      const firstCard = grid.querySelector(
        '.tile-card[data-handle="maquk_mieczaki"]',
      );
      expect(firstCard).not.toBeNull();

      const img = firstCard?.querySelector(
        "img.tile-avatar",
      ) as HTMLImageElement;
      expect(img.getAttribute("src")).toBe("./avatars/maquk_mieczaki.jpg");

      const followers = firstCard?.querySelector(
        '[data-testid="followers-count"]',
      );
      expect(followers?.textContent).toBe("21,000");

      const posts = firstCard?.querySelector('[data-testid="posts-count"]');
      expect(posts?.textContent).toBe("110");

      const progressBar = firstCard?.querySelector(
        ".progress-bar-fill",
      ) as HTMLElement;
      expect(progressBar).not.toBeNull();
      // 21000 target is 50000 -> 42%
      const target = firstCard?.querySelector(".milestone-target");
      expect(target?.textContent).toBe("42%");
    });
  });

  describe("UI Integrity & Read-Only Constraints", () => {
    it("does not contain any edit or manual refresh buttons", () => {
      const header = createHeader(contestants);
      const podium = createPodium(contestants);
      const grid = createTileGrid(contestants, 3);

      document.body.appendChild(header);
      document.body.appendChild(podium);
      document.body.appendChild(grid);

      const buttons = document.querySelectorAll("button");
      expect(buttons.length).toBe(0);

      const editElements = document.querySelectorAll(
        '[data-action="edit"], .edit-btn, .refresh-btn',
      );
      expect(editElements.length).toBe(0);
    });
  });
});
