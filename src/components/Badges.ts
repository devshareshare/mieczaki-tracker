import { getBadges } from "../services/dataService";
import type {
  Contestant,
  HistorySnapshot,
  LatestSnapshot,
} from "../types/data";

export function createBadges(
  latest: LatestSnapshot,
  history: HistorySnapshot[],
): HTMLElement {
  const section = document.createElement("section");
  section.className = "badges-section";

  const headerGroup = document.createElement("div");
  headerGroup.className = "section-header-group";

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = "WYRÓŻNIENIA I BADGE'E (TYGODNIOWE)";

  const subtitle = document.createElement("p");
  subtitle.className = "section-subtitle";
  subtitle.textContent = "Wyniki z ostatnich 7 dni";

  headerGroup.appendChild(title);
  headerGroup.appendChild(subtitle);
  section.appendChild(headerGroup);

  const grid = document.createElement("div");
  grid.className = "badges-grid";

  const calculatedBadges = getBadges(latest, history);
  const contestants = latest?.contestants || [];

  const findContestant = (handle?: string): Contestant | undefined => {
    if (!handle) return undefined;
    return contestants.find((c) => c.handle === handle);
  };

  // 1. Top Weekly Gainer
  const gainerData = calculatedBadges.topWeeklyGainer;
  const gainerContestant = findContestant(gainerData?.handle);
  const gainerCard = createBadgeCard({
    badgeType: "top-weekly-gainer",
    icon: "🔥",
    category: "TYGODNIOWY LIDER WZROSTU",
    title: "Top Weekly Gainer",
    timeframe: "Ostatnie 7 dni",
    contestant: gainerContestant,
    handle: gainerData?.handle,
    metricText: gainerData
      ? `+${gainerData.gained.toLocaleString("en-US")} obserwujących`
      : "Brak danych",
  });
  grid.appendChild(gainerCard);

  // 2. Fastest % Growth
  const growthData = calculatedBadges.fastestPercentageGrowth;
  const growthContestant = findContestant(growthData?.handle);
  const growthCard = createBadgeCard({
    badgeType: "fastest-percentage-growth",
    icon: "🚀",
    category: "NAJSZYBSZY TYGODNIOWY % WZROST",
    title: "Fastest Weekly % Growth",
    timeframe: "Ostatnie 7 dni",
    contestant: growthContestant,
    handle: growthData?.handle,
    metricText: growthData ? `+${growthData.percent}%` : "Brak danych",
  });
  grid.appendChild(growthCard);

  // 3. Most Active Poster
  const posterData = calculatedBadges.mostActivePoster;
  const posterContestant = findContestant(posterData?.handle);
  const posterCard = createBadgeCard({
    badgeType: "most-active-poster",
    icon: "📸",
    category: "NAJBARDZIEJ AKTYWNY W TYGODNIU",
    title: "Most Active Weekly Poster",
    timeframe: "Ostatnie 7 dni",
    contestant: posterContestant,
    handle: posterData?.handle,
    metricText: posterData
      ? `${posterData.posts.toLocaleString("en-US")} postów`
      : "Brak danych",
  });
  grid.appendChild(posterCard);

  section.appendChild(grid);
  return section;
}

interface BadgeCardOptions {
  badgeType: string;
  icon: string;
  category: string;
  title: string;
  timeframe?: string;
  contestant?: Contestant;
  handle?: string;
  metricText: string;
}

function createBadgeCard(options: BadgeCardOptions): HTMLElement {
  const card = document.createElement("div");
  card.className = "badge-card";
  card.setAttribute("data-badge-type", options.badgeType);

  const { contestant, handle, icon, category, title, timeframe, metricText } =
    options;
  const displayName = contestant
    ? contestant.name
    : handle
      ? `@${handle}`
      : "Brak danych";
  const displayHandle = handle ? `@${handle}` : "";
  const rawAvatar =
    contestant?.avatar || (handle ? `./avatars/${handle}.jpg` : "");
  const avatarPath = rawAvatar ? rawAvatar.replace(/^\//, "./") : "";
  const instagramUrl =
    contestant?.instagramUrl ||
    (handle ? `https://www.instagram.com/${handle}/` : "#");

  card.innerHTML = `
    <div class="badge-card-header">
      <div class="badge-icon-bubble">${icon}</div>
      <div class="badge-title-group">
        <span class="badge-category">${category}</span>
        <h3 class="badge-title">${title}</h3>
        ${timeframe ? `<span class="badge-timeframe">${timeframe}</span>` : ""}
      </div>
    </div>
    <div class="badge-body">
      ${
        avatarPath
          ? `<img src="${avatarPath}" alt="${displayName}" class="badge-avatar" onerror="this.onerror=null; this.src='./avatars/${handle}.jpg';" />`
          : ""
      }
      <div class="badge-contestant-info">
        <span class="badge-contestant-name">${displayName}</span>
        ${
          displayHandle
            ? `<a href="${instagramUrl}" target="_blank" rel="noopener noreferrer" class="badge-contestant-handle">${displayHandle}</a>`
            : ""
        }
      </div>
    </div>
    <div class="badge-stat-pill" data-testid="badge-metric">${metricText}</div>
  `;

  return card;
}

export function renderBadges(
  container: HTMLElement,
  latest: LatestSnapshot,
  history: HistorySnapshot[],
): HTMLElement {
  const badgesElement = createBadges(latest, history);
  container.appendChild(badgesElement);
  return badgesElement;
}
