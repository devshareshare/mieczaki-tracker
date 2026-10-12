import type { Contestant } from "../types/data";

export function createExMieczaki(contestants: Contestant[]): HTMLElement {
  const section = document.createElement("section");
  section.className = "ex-mieczaki-section";

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = "EX-MIECZAKI";
  section.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "ex-mieczaki-grid";

  // Defensive sort by followers descending (then name for stability),
  // mirroring the ranking order of the active contestants.
  const sorted = [...contestants].sort((a, b) => {
    if (b.followers !== a.followers) {
      return b.followers - a.followers;
    }
    return a.name.localeCompare(b.name);
  });

  for (const contestant of sorted) {
    const avatarPath = contestant.avatar
      ? contestant.avatar.replace(/^\//, "./")
      : `./avatars/${contestant.handle}.jpg`;
    const formattedFollowers = contestant.followers.toLocaleString("en-US");
    const formattedPosts = contestant.posts.toLocaleString("en-US");

    const card = document.createElement("div");
    card.className = "ex-mieczaki-card";
    card.setAttribute("data-handle", contestant.handle);

    card.innerHTML = `
      <img
        src="${avatarPath}"
        alt="${contestant.name}"
        class="ex-mieczaki-avatar"
        onerror="this.onerror=null; this.src='./avatars/${contestant.handle}.jpg';"
      />
      <h3 class="ex-mieczaki-name">${contestant.name}</h3>
      <a
        href="${contestant.instagramUrl}"
        target="_blank"
        rel="noopener noreferrer"
        class="ex-mieczaki-handle"
      >
        @${contestant.handle}
      </a>
      <div class="ex-mieczaki-stats">
        <div class="ex-mieczaki-stat">
          <span class="ex-mieczaki-stat-value" data-testid="followers-count">${formattedFollowers}</span>
          <span class="ex-mieczaki-stat-label">Obserwujących</span>
        </div>
        <div class="ex-mieczaki-stat">
          <span class="ex-mieczaki-stat-value" data-testid="posts-count">${formattedPosts}</span>
          <span class="ex-mieczaki-stat-label">Postów</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
}

export function renderExMieczaki(
  container: HTMLElement,
  contestants: Contestant[],
): HTMLElement {
  const element = createExMieczaki(contestants);
  container.appendChild(element);
  return element;
}
