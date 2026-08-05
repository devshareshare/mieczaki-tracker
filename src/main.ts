import historyData from "../data/history.json";
import latestData from "../data/latest.json";
import { renderBadges } from "./components/Badges";
import { renderCharts } from "./components/Charts";
import { renderHeader } from "./components/Header";
import { renderPodium } from "./components/Podium";
import { renderTileGrid } from "./components/TileGrid";
import { getRankedContestants } from "./services/dataService";
import "./styles/main.css";
import type { HistorySnapshot, LatestSnapshot } from "./types/data";

function initApp(): void {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = "";
  const latest = latestData as LatestSnapshot;
  const history = historyData as HistorySnapshot[];
  const rankedContestants = getRankedContestants(latest);

  renderHeader(app, rankedContestants);
  renderPodium(app, rankedContestants);
  renderBadges(app, latest, history);
  renderTileGrid(app, rankedContestants);
  renderCharts(app, history, latest);
}

document.addEventListener("DOMContentLoaded", initApp);

// Also run immediately if DOM is already loaded
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  initApp();
}
