import { beforeEach, describe, expect, it } from "vitest";
import { createExMieczaki } from "../src/components/ExMieczaki";
import type { Contestant } from "../src/types/data";

const mockExMieczaki: Contestant[] = [
  {
    id: "nadia_mieczaki",
    name: "Nadia Oterska",
    handle: "nadia_mieczaki",
    followers: 12200,
    posts: 63,
    avatar: "./avatars/nadia_mieczaki.jpg",
    instagramUrl: "https://www.instagram.com/nadia_mieczaki/",
  },
  {
    id: "mikolaj_mieczaki",
    name: "Mikołaj Regewicz",
    handle: "mikolaj_mieczaki",
    followers: 20600,
    posts: 26,
    avatar: "./avatars/mikolaj_mieczaki.jpg",
    instagramUrl: "https://www.instagram.com/mikolaj_mieczaki/",
  },
];

describe("ExMieczaki Component", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a section titled EX-MIECZAKI with one card per contestant", () => {
    const section = createExMieczaki(mockExMieczaki);

    expect(section.querySelector(".section-title")?.textContent).toBe(
      "EX-MIECZAKI",
    );
    const cards = section.querySelectorAll(".ex-mieczaki-card");
    expect(cards).toHaveLength(2);
  });

  it("sorts contestants by followers descending", () => {
    const section = createExMieczaki(mockExMieczaki);
    const cards = section.querySelectorAll(".ex-mieczaki-card");

    const handles = Array.from(cards).map((card) =>
      card.getAttribute("data-handle"),
    );
    expect(handles).toEqual(["mikolaj_mieczaki", "nadia_mieczaki"]);
  });

  it("renders follower/post counts and instagram link but no rank or goal", () => {
    const section = createExMieczaki(mockExMieczaki);
    const firstCard = section.querySelector(".ex-mieczaki-card");

    expect(
      firstCard?.querySelector('[data-testid="followers-count"]')?.textContent,
    ).toBe("20,600");
    expect(
      firstCard?.querySelector('[data-testid="posts-count"]')?.textContent,
    ).toBe("26");

    const handleLink = firstCard?.querySelector("a.ex-mieczaki-handle");
    expect(handleLink?.getAttribute("href")).toBe(
      "https://www.instagram.com/mikolaj_mieczaki/",
    );

    // Ex-mieczaki must have no rank badge and no milestone/progress bar.
    expect(firstCard?.querySelector(".tile-rank")).toBeNull();
    expect(firstCard?.querySelector(".milestone-container")).toBeNull();
    expect(firstCard?.querySelector(".progress-bar-bg")).toBeNull();
  });

  it("renders an empty grid when given no contestants", () => {
    const section = createExMieczaki([]);
    expect(section.querySelectorAll(".ex-mieczaki-card")).toHaveLength(0);
  });
});
