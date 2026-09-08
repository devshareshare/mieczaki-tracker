import { getMilestoneProgress } from "../services/dataService";
import type { Contestant } from "../types/data";

export function createTileGrid(
  contestants: Contestant[],
  startIndex = 3,
): HTMLElement {
  const section = document.createElement("section");
  section.className = "grid-section";

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = "POZOSTALI UCZESTNICY";
  section.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "tile-grid";

  const gridContestants =
    contestants.length > startIndex && startIndex > 0
      ? contestants.slice(startIndex)
      : contestants;

  for (let index = 0; index < gridContestants.length; index++) {
    const contestant = gridContestants[index];
    const rank =
      (contestants.length > startIndex && startIndex > 0 ? startIndex : 0) +
      index +
      1;
    const cleanAvatar = contestant.avatar
      ? contestant.avatar.replace(/^\//, "./")
      : `./avatars/${contestant.handle}.jpg`;
    const avatarPath = cleanAvatar;
    const milestone = getMilestoneProgress(contestant.followers);
    const formattedFollowers = contestant.followers.toLocaleString("en-US");
    const formattedPosts = contestant.posts.toLocaleString("en-US");

    const card = document.createElement("div");
    card.className = "tile-card";
    card.setAttribute("data-handle", contestant.handle);
    card.setAttribute("data-rank", rank.toString());

    card.innerHTML = `
      <div class="tile-rank">#${rank}</div>
      <div class="tile-header">
        <img 
          src="${avatarPath}" 
          alt="${contestant.name}" 
          class="tile-avatar"
          onerror="this.onerror=null; this.src='./avatars/${contestant.handle}.jpg';"
        />
        <div class="tile-info">
          <h3 class="tile-name">${contestant.name}</h3>
          <a 
            href="${contestant.instagramUrl}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="tile-handle"
          >
            @${contestant.handle}
          </a>
        </div>
      </div>

      <div class="tile-stats">
        <div class="tile-stat">
          <span class="tile-stat-value" data-testid="followers-count">${formattedFollowers}</span>
          <span class="tile-stat-label">Obserwujących</span>
        </div>
        <div class="tile-stat">
          <span class="tile-stat-value" data-testid="posts-count">${formattedPosts}</span>
          <span class="tile-stat-label">Postów</span>
        </div>
      </div>

      <div class="milestone-container">
        <div class="milestone-info">
          <span class="milestone-label">Cel: ${milestone.target.toLocaleString("en-US")}</span>
          <span class="milestone-target">${milestone.percent}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${milestone.percent}%"></div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
}

export function renderTileGrid(
  container: HTMLElement,
  contestants: Contestant[],
  startIndex = 3,
): HTMLElement {
  const gridElement = createTileGrid(contestants, startIndex);
  container.appendChild(gridElement);
  return gridElement;
}
