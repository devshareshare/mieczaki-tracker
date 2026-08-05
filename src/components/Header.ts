import type { Contestant } from "../types/data";

export function createHeader(contestants: Contestant[]): HTMLElement {
  const totalFollowers = (contestants || []).reduce(
    (sum, c) => sum + Math.max(0, c.followers || 0),
    0,
  );
  const formattedTotal = totalFollowers.toLocaleString("en-US");

  const header = document.createElement("header");
  header.className = "header";

  header.innerHTML = `
    <div class="header-container">
      <div class="header-badge">
        <span class="pulse-dot"></span>
        <span>LIVE LEADERBOARD</span>
      </div>
      <h1 class="header-title">MIĘCZAKI <span>TRACKER</span></h1>
      <p class="header-subtitle">Oficjalny ranking społecznościowy uczestników programu Mięczaki</p>
      
      <div class="header-stats">
        <div class="stat-card">
          <span class="stat-label">Łącznie Obserwujących</span>
          <span class="stat-value" data-testid="total-followers">${formattedTotal}</span>
        </div>
      </div>
    </div>
  `;

  return header;
}

export function renderHeader(
  container: HTMLElement,
  contestants: Contestant[],
): HTMLElement {
  const headerElement = createHeader(contestants);
  container.appendChild(headerElement);
  return headerElement;
}
