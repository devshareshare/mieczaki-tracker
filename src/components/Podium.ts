import { getMilestoneProgress } from "../services/dataService";
import type { Contestant } from "../types/data";

interface PodiumPosition {
  contestant: Contestant;
  rank: number;
  type: "gold" | "silver" | "bronze";
  title: string;
}

export function createPodium(contestants: Contestant[]): HTMLElement {
  const section = document.createElement("section");
  section.className = "podium-section";

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = "PODIUM LEADERBOARD";
  section.appendChild(title);

  const container = document.createElement("div");
  container.className = "podium-container";

  // Assign positions: 1st (Gold), 2nd (Silver), 3rd (Bronze)
  const topThree: PodiumPosition[] = [];

  if (contestants.length > 1) {
    topThree.push({
      contestant: contestants[1],
      rank: 2,
      type: "silver",
      title: "2. MIEJSCE",
    });
  }

  if (contestants.length > 0) {
    topThree.push({
      contestant: contestants[0],
      rank: 1,
      type: "gold",
      title: "1. MIEJSCE",
    });
  }

  if (contestants.length > 2) {
    topThree.push({
      contestant: contestants[2],
      rank: 3,
      type: "bronze",
      title: "3. MIEJSCE",
    });
  }

  for (const { contestant, rank, type, title: _rankTitle } of topThree) {
    const cleanAvatar = contestant.avatar
      ? contestant.avatar.replace(/^\//, "./")
      : `./avatars/${contestant.handle}.jpg`;
    const avatarPath = cleanAvatar;
    const milestone = getMilestoneProgress(contestant.followers);
    const formattedFollowers = contestant.followers.toLocaleString("en-US");
    const formattedPosts = contestant.posts.toLocaleString("en-US");

    const card = document.createElement("div");
    card.className = `podium-card ${type}`;
    card.setAttribute("data-handle", contestant.handle);
    card.setAttribute("data-rank", rank.toString());

    card.innerHTML = `
      <div class="podium-rank-badge">#${rank}</div>
      <div class="avatar-wrapper">
        <img 
          src="${avatarPath}" 
          alt="${contestant.name}" 
          class="avatar-image"
          onerror="this.onerror=null; this.src='./avatars/${contestant.handle}.jpg';"
        />
      </div>
      <h3 class="contestant-name">${contestant.name}</h3>
      <a 
        href="${contestant.instagramUrl}" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="contestant-handle"
      >
        @${contestant.handle}
      </a>
      
      <div class="podium-stats">
        <div class="stat-item">
          <span class="value" data-testid="followers-count">${formattedFollowers}</span>
          <span class="label">Obserwujących</span>
        </div>
        <div class="stat-item">
          <span class="value" data-testid="posts-count">${formattedPosts}</span>
          <span class="label">Postów</span>
        </div>
      </div>

      <div class="milestone-container" style="width: 100%; margin-top: 1rem;">
        <div class="milestone-info">
          <span class="milestone-label">Cel: ${milestone.target.toLocaleString("en-US")}</span>
          <span class="milestone-target">${milestone.percent}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${milestone.percent}%"></div>
        </div>
      </div>
    `;

    container.appendChild(card);
  }

  section.appendChild(container);
  return section;
}

export function renderPodium(
  container: HTMLElement,
  contestants: Contestant[],
): HTMLElement {
  const podiumElement = createPodium(contestants);
  container.appendChild(podiumElement);
  return podiumElement;
}
