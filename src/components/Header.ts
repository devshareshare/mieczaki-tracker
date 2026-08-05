import type { Contestant, LatestSnapshot } from "../types/data";

function formatDate(isoString?: string): string {
  if (!isoString) return "dzisiaj";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "dzisiaj";
  }
}

export function createHeader(
  _contestants: Contestant[],
  latest?: LatestSnapshot,
): HTMLElement {
  const header = document.createElement("header");
  header.className = "header";

  const formattedDate = formatDate(latest?.timestamp);

  header.innerHTML = `
    <div class="header-container">
      <div class="header-badges-row">
        <div class="header-badge">
          <span class="pulse-dot"></span>
          <span>LIVE LEADERBOARD</span>
        </div>
        <div class="last-updated-badge">
          <span class="clock-icon">🕒</span>
          <span>Ostatnia aktualizacja: <strong>${formattedDate}</strong></span>
        </div>
      </div>
      <h1 class="header-title">MIĘCZAKI <span>TRACKER</span></h1>
      <p class="header-subtitle">Oficjalny ranking społecznościowy uczestników programu Mięczaki</p>
    </div>
  `;

  return header;
}

export function renderHeader(
  container: HTMLElement,
  contestants: Contestant[],
  latest?: LatestSnapshot,
): HTMLElement {
  const headerElement = createHeader(contestants, latest);
  container.appendChild(headerElement);
  return headerElement;
}
