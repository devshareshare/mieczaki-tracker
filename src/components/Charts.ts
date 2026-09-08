import Chart from "chart.js/auto";
import { getGrowthChartData, getMonthlyStats } from "../services/dataService";
import type { HistorySnapshot, LatestSnapshot } from "../types/data";

const CONTESTANT_COLORS: Record<string, string> = {
  pamelka_mieczaki: "#c8ff00",
  filip_mieczaki: "#ffd700",
  pati_mieczaki: "#c0c0c0",
  maquk_mieczaki: "#cd7f32",
  stachu_goggins_mieczaki: "#38bdf8",
  wiktor_mieczaki: "#a855f7",
  magda_mieczaki: "#f43f5e",
  dori_mieczaki: "#fb923c",
  patrykbutrym_mieczaki: "#4ade80",
  oktawia_mieczaki: "#22d3ee",
  oliwia_mieczaki: "#e879f9",
  patrycja_mieczaki: "#facc15",
};

const DEFAULT_COLOR = "#c8ff00";

function getColorForHandle(handle: string): string {
  return CONTESTANT_COLORS[handle] || DEFAULT_COLOR;
}

export function createCharts(
  history: HistorySnapshot[],
  _latest?: LatestSnapshot,
): HTMLElement {
  const section = document.createElement("section");
  section.className = "charts-section";

  const mainTitle = document.createElement("h2");
  mainTitle.className = "section-title";
  mainTitle.textContent = "STATYSTYKI I ANALITYKA WZROSTU";
  section.appendChild(mainTitle);

  // 1. Follower Growth Trajectory (Full Width)
  const trajectoryCard = document.createElement("div");
  trajectoryCard.className = "chart-card";

  trajectoryCard.innerHTML = `
    <div class="chart-card-header">
      <h3 class="chart-card-title">📈 TRAJEKTORIA WZROSTU OBSERWUJĄCYCH</h3>
      <div class="chart-controls" id="range-controls">
        <button class="filter-btn active" data-range="all">Wszystko</button>
        <button class="filter-btn" data-range="30d">Ostatnie 30 dni</button>
        <button class="filter-btn" data-range="7d">Ostatnie 7 dni</button>
      </div>
    </div>
    <div class="contestant-toggles" id="contestant-toggles">
      <!-- Generated dynamically -->
    </div>
    <div class="chart-container-wrapper">
      <canvas id="growth-trajectory-chart"></canvas>
    </div>
  `;
  section.appendChild(trajectoryCard);

  // 2 & 3. Grid for Monthly Followers Gained & Monthly Posts Published
  const gridContainer = document.createElement("div");
  gridContainer.className = "charts-grid";

  // Monthly Followers Gained
  const followersBarCard = document.createElement("div");
  followersBarCard.className = "chart-card";
  followersBarCard.innerHTML = `
    <div class="chart-card-header">
      <h3 class="chart-card-title">📊 OBSERWUJĄCY ZYSKANI MIESIĘCZNIE</h3>
    </div>
    <div class="chart-container-wrapper">
      <canvas id="monthly-followers-chart"></canvas>
    </div>
  `;
  gridContainer.appendChild(followersBarCard);

  // Monthly Posts Published
  const postsBarCard = document.createElement("div");
  postsBarCard.className = "chart-card";
  postsBarCard.innerHTML = `
    <div class="chart-card-header">
      <h3 class="chart-card-title">📸 POSTY OPUBLIKOWANE MIESIĘCZNIE</h3>
    </div>
    <div class="chart-container-wrapper">
      <canvas id="monthly-posts-chart"></canvas>
    </div>
  `;
  gridContainer.appendChild(postsBarCard);

  section.appendChild(gridContainer);

  // Initialize Charts when appended or immediately
  setTimeout(() => {
    initTrajectoryChart(section, history);
    initMonthlyFollowersChart(section, history);
    initMonthlyPostsChart(section, history);
  }, 0);

  return section;
}

function initTrajectoryChart(
  container: HTMLElement,
  history: HistorySnapshot[],
) {
  const canvas = container.querySelector(
    "#growth-trajectory-chart",
  ) as HTMLCanvasElement | null;
  if (!canvas) return;

  const togglesContainer = container.querySelector("#contestant-toggles");
  const rangeControls = container.querySelector("#range-controls");

  let currentHistory = [...history];

  const filterHistoryByRange = (range: string): HistorySnapshot[] => {
    if (!history || history.length === 0) return [];
    const sorted = [...history].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    if (range === "7d") {
      const latestTime = new Date(
        sorted[sorted.length - 1].timestamp,
      ).getTime();
      const cutoff = latestTime - 7 * 24 * 60 * 60 * 1000;
      return sorted.filter((s) => new Date(s.timestamp).getTime() >= cutoff);
    }
    if (range === "30d") {
      const latestTime = new Date(
        sorted[sorted.length - 1].timestamp,
      ).getTime();
      const cutoff = latestTime - 30 * 24 * 60 * 60 * 1000;
      return sorted.filter((s) => new Date(s.timestamp).getTime() >= cutoff);
    }
    return sorted;
  };

  const chartData = getGrowthChartData(currentHistory);

  const datasets = chartData.datasets.map((ds) => {
    const color = getColorForHandle(ds.handle);
    return {
      label: ds.label,
      data: ds.data,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      tension: 0.2,
      pointRadius: chartData.labels.length > 20 ? 0 : 3,
      pointHoverRadius: 6,
    };
  });

  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: chartData.labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "#1e1e1e",
          titleColor: "#c8ff00",
          bodyColor: "#f3f4f6",
          borderColor: "#2e2e2e",
          borderWidth: 1,
          padding: 10,
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#9ca3af", maxTicksLimit: 12 },
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: {
            color: "#9ca3af",
            callback: (value) => Number(value).toLocaleString("en-US"),
          },
        },
      },
    },
  });

  // Render Contestant Toggle Chips
  if (togglesContainer) {
    togglesContainer.innerHTML = "";

    const allBtn = document.createElement("button");
    allBtn.className = "filter-btn";
    allBtn.style.padding = "0.2rem 0.5rem";
    allBtn.style.fontSize = "0.7rem";
    allBtn.textContent = "Pokaż wszystkich";
    allBtn.onclick = () => {
      for (let idx = 0; idx < chart.data.datasets.length; idx++) {
        chart.setDatasetVisibility(idx, true);
      }
      chart.update();
      const chips = togglesContainer.querySelectorAll(".toggle-chip");
      for (const chip of chips) {
        chip.classList.add("active");
      }
    };

    const noneBtn = document.createElement("button");
    noneBtn.className = "filter-btn";
    noneBtn.style.padding = "0.2rem 0.5rem";
    noneBtn.style.fontSize = "0.7rem";
    noneBtn.textContent = "Ukryj wszystkich";
    noneBtn.onclick = () => {
      for (let idx = 0; idx < chart.data.datasets.length; idx++) {
        chart.setDatasetVisibility(idx, false);
      }
      chart.update();
      const chips = togglesContainer.querySelectorAll(".toggle-chip");
      for (const chip of chips) {
        chip.classList.remove("active");
      }
    };

    togglesContainer.appendChild(allBtn);
    togglesContainer.appendChild(noneBtn);

    for (let index = 0; index < chartData.datasets.length; index++) {
      const ds = chartData.datasets[index];
      const color = getColorForHandle(ds.handle);
      const chip = document.createElement("button");
      chip.className = "toggle-chip active";
      chip.style.setProperty("--chip-color", color);
      chip.textContent = ds.label;
      chip.onclick = () => {
        const isVisible = chart.isDatasetVisible(index);
        chart.setDatasetVisibility(index, !isVisible);
        chart.update();
        chip.classList.toggle("active", !isVisible);
      };
      togglesContainer.appendChild(chip);
    }
  }

  // Handle Range Filter Clicks
  if (rangeControls) {
    const btns = rangeControls.querySelectorAll(".filter-btn");
    for (const btn of btns) {
      btn.addEventListener("click", () => {
        for (const b of btns) {
          b.classList.remove("active");
        }
        btn.classList.add("active");

        const range = btn.getAttribute("data-range") || "all";
        currentHistory = filterHistoryByRange(range);
        const newData = getGrowthChartData(currentHistory);

        chart.data.labels = newData.labels;
        for (let idx = 0; idx < newData.datasets.length; idx++) {
          if (chart.data.datasets[idx]) {
            chart.data.datasets[idx].data = newData.datasets[idx].data;
          }
        }
        chart.update();
      });
    }
  }
}

function initMonthlyFollowersChart(
  container: HTMLElement,
  history: HistorySnapshot[],
) {
  const canvas = container.querySelector(
    "#monthly-followers-chart",
  ) as HTMLCanvasElement | null;
  if (!canvas) return;

  const monthlyStats = getMonthlyStats(history);
  const labels = monthlyStats.map((s) => s.month);

  const handlesSet = new Set<string>();
  for (const s of monthlyStats) {
    for (const h of Object.keys(s.followersGained)) {
      handlesSet.add(h);
    }
  }

  const datasets = Array.from(handlesSet).map((handle) => {
    const color = getColorForHandle(handle);
    const data = monthlyStats.map((s) => s.followersGained[handle] || 0);
    return {
      label: `@${handle}`,
      data,
      backgroundColor: color,
      borderRadius: 4,
    };
  });

  new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#f3f4f6",
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            usePointStyle: true,
            boxWidth: 8,
          },
        },
        tooltip: {
          backgroundColor: "#1e1e1e",
          titleColor: "#c8ff00",
          bodyColor: "#f3f4f6",
          borderColor: "#2e2e2e",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#9ca3af" },
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#9ca3af" },
        },
      },
    },
  });
}

function initMonthlyPostsChart(
  container: HTMLElement,
  history: HistorySnapshot[],
) {
  const canvas = container.querySelector(
    "#monthly-posts-chart",
  ) as HTMLCanvasElement | null;
  if (!canvas) return;

  const monthlyStats = getMonthlyStats(history);
  const labels = monthlyStats.map((s) => s.month);

  const handlesSet = new Set<string>();
  for (const s of monthlyStats) {
    for (const h of Object.keys(s.postsPublished)) {
      handlesSet.add(h);
    }
  }

  const datasets = Array.from(handlesSet).map((handle) => {
    const color = getColorForHandle(handle);
    const data = monthlyStats.map((s) => s.postsPublished[handle] || 0);
    return {
      label: `@${handle}`,
      data,
      backgroundColor: color,
      borderRadius: 4,
    };
  });

  new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#f3f4f6",
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            usePointStyle: true,
            boxWidth: 8,
          },
        },
        tooltip: {
          backgroundColor: "#1e1e1e",
          titleColor: "#c8ff00",
          bodyColor: "#f3f4f6",
          borderColor: "#2e2e2e",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#9ca3af" },
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#9ca3af" },
        },
      },
    },
  });
}

export function renderCharts(
  container: HTMLElement,
  history: HistorySnapshot[],
  latest?: LatestSnapshot,
): HTMLElement {
  const chartsElement = createCharts(history, latest);
  container.appendChild(chartsElement);
  return chartsElement;
}
