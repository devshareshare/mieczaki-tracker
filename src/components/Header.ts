import type { Contestant } from "../types/data";

export function createHeader(_contestants: Contestant[]): HTMLElement {
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
