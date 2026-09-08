# Mięczaki Tracker

Automated Instagram follower and post count tracker for the Polish fitness reality show **"Mięczaki"** created by Adam Josef Modzelewski (AJ / [@ajthepolishamerican](https://instagram.com/ajthepolishamerican)). 

Tracks 12 contestants competing in a 6-month physical/mental transformation program for a 200,000 PLN prize and an OYCHE contract.

---

## 🚀 Live Site & Autopilot Deployment

The application is deployed automatically to **GitHub Pages**. A `@reboot` cron job on the host machine runs `scripts/daily-run.sh` at boot to:
1. Scrape Instagram follower and post counts for all 12 contestants using `scripts/scraper.py` (headless browser, residential IP).
2. Update `data/latest.json` and append a snapshot to `data/history.json` — only when the numbers actually change.
3. Commit and push the data change, which triggers `.github/workflows/deploy.yml` to build and deploy the static site.

(Instagram blocks GitHub's datacenter IPs, so the scrape runs from the host's residential IP instead of GitHub Actions. `.github/workflows/daily-update.yml` remains as a manual `workflow_dispatch` fallback only.)

---

## ✨ Features

- **Centered Show Header**: Clean display title, show subtitle, and live status badge with lime `#c8ff00` accents on dark `#121212` show theme.
- **Top 3 Podium**: Gold (#1, center/highest on desktop, #1 top on mobile), Silver (#2, left), and Bronze (#3, right) cards featuring rank badges, face-zoomed avatars, verified follower counts, post counts, and unified 50,000 follower milestone progress bars.
- **Contestant Grid**: Ranks 4 through 12 cards displaying full names, handles, face-zoomed avatars, follower counts, post counts, and unified 50,000 follower milestone progress bars.
- **Centered Weekly Special Badges**:
  - 🔥 **Top Weekly Gainer**: Highlights the contestant who gained the most followers in the last 7 days.
  - 🚀 **Fastest Weekly % Growth**: Highlights the contestant with the highest percentage growth in the last 7 days.
  - 📸 **Most Active Weekly Poster**: Highlights the contestant with the highest post output in the last 7 days.
- **Interactive Chart.js Diagrams**:
  - **Follower Growth Trajectory**: Multi-line line chart tracking follower trends over time with range selectors (*Wszystko*, *Ostatnie 30 dni*, *Ostatnie 7 dni*) and interactive contestant selection chips.
  - **Monthly Followers Gained**: Bar chart comparing follower growth aggregated by calendar month.
  - **Monthly Posts Published**: Bar chart comparing posts published aggregated by calendar month.
- **Static Local Avatars**: High-resolution contestant photos stored in `public/avatars/` to guarantee zero broken Instagram CDN links.
- **Pure Read-Only UI**: Runs on autopilot without manual edit or client-side refresh buttons.

---

## 👥 Tracked Contestants (12)

| Rank | Handle | Name | Followers | Posts |
|---|---|---|---|---|
| **#1** | [@pamelka_mieczaki](https://instagram.com/pamelka_mieczaki) | Pamela Kiedrowicz | ~48.0k | 29 |
| **#2** | [@pati_mieczaki](https://instagram.com/pati_mieczaki) | Patrycja "Pati" Tomaszewska | ~44.0k | 24 |
| **#3** | [@stachu_goggins_mieczaki](https://instagram.com/stachu_goggins_mieczaki) | Stanisław "Stachu" Dybowski | ~39.1k | 25 |
| **#4** | [@wiktor_mieczaki](https://instagram.com/wiktor_mieczaki) | Wiktor Woroniak | ~39.1k | 23 |
| **#5** | [@maquk_mieczaki](https://instagram.com/maquk_mieczaki) | Dominik "Maquk" Makowiak | ~34.4k | 9 |
| **#6** | [@filip_mieczaki](https://instagram.com/filip_mieczaki) | Filip Wrzosek | ~32.9k | 45 |
| **#7** | [@magda_mieczaki](https://instagram.com/magda_mieczaki) | Magdalena Majewska | ~31.2k | 26 |
| **#8** | [@dori_mieczaki](https://instagram.com/dori_mieczaki) | Dorota "Dori" Kaczmarek | ~27.1k | 49 |
| **#9** | [@oktawia_mieczaki](https://instagram.com/oktawia_mieczaki) | Oktawia Juszczyk | ~26.5k | 75 |
| **#10** | [@patrykbutrym_mieczaki](https://instagram.com/patrykbutrym_mieczaki) | Patryk Butrym | ~21.8k | 26 |
| **#11** | [@oliwia_mieczaki](https://instagram.com/oliwia_mieczaki) | Oliwia Płodzień | 9,862 | 17 |
| **#12** | [@patrycja_mieczaki](https://instagram.com/patrycja_mieczaki) | Patrycja Bochyńska | 9,437 | 52 |

*Follower counts ≥10k reflect Instagram's public 0.1K display precision; counts under 10k are exact. This table is a manual snapshot — the live site reads `data/latest.json`.*

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Vite + TypeScript (strict mode) + Chart.js + CSS Variables (dark theme `#121212`, lime accent `#c8ff00`).
- **Data Engine**:
  - `data/latest.json`: Current snapshot holding rankings, follower counts, post counts, and local avatar paths.
  - `data/history.json`: Time-series log containing daily snapshots.
  - `src/services/dataService.ts`: Pure computation module for sorting, badge calculations, progress milestones, and monthly aggregations.
- **Scraper Script**: Python 3 (`scripts/scraper.py`) with multi-strategy fallback — follower counts read from the rendered Instagram profile via a headless browser (`agent-browser`; exact under 10k, 0.1K precision above), with HTTP mirrors (`web_profile_info`, Imginn, `og:description`) as fallback; post counts via `og:description`. Includes User-Agent rotation, follower anomaly guards, and fallback metrics retention.
- **CI/CD Pipelines**:
  - `scripts/daily-run.sh` + `@reboot` cron: Boot-triggered scrape, commit, and push — the primary update path.
  - `.github/workflows/deploy.yml`: Builds and deploys to GitHub Pages on every push to `main`.
  - `.github/workflows/ci.yml`: Pull request and push test/typecheck validation.
  - `.github/workflows/daily-update.yml`: Manual-only (`workflow_dispatch`) scrape + deploy fallback.
- **Tooling**: Biome (linting/formatting), Vitest (JS/TS tests), `unittest` (Python scraper tests).

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript type check
npm run typecheck

# Run Biome linting and formatting check
npm run check

# Run Vitest JS/TS unit tests
npm run test

# Run Python scraper unit tests
python3 -m unittest discover tests

# Build static production assets to dist/
npm run build

# Preview production build locally
python3 -m http.server 8080 -d dist
```

---

## 📁 Project Structure

```text
mieczaki-tracker/
├── .github/workflows/
│   ├── deploy.yml         # Build + deploy to GitHub Pages on push
│   ├── daily-update.yml   # Manual-only scrape + deploy fallback
│   └── ci.yml             # PR and push test validation workflow
├── .scratch/
│   └── mieczaki-tracker-modernization/
│       ├── PRD.md         # Product requirements document & user stories
│       └── issues/        # Sliced implementation tickets (01 to 06)
├── data/
│   ├── latest.json        # Current snapshot metrics
│   └── history.json       # Time-series snapshot log
├── public/
│   └── avatars/           # High-resolution contestant profile photos
├── scripts/
│   ├── daily-run.sh       # Boot-triggered scrape → commit → push runner
│   └── scraper.py         # Instagram scraper (headless browser + HTTP fallback)
├── src/
│   ├── components/
│   │   ├── Header.ts      # Main show header
│   │   ├── Podium.ts      # Top 3 Podium component
│   │   ├── TileGrid.ts    # Ranks 4-12 tile grid component
│   │   ├── Badges.ts      # Centered special badges
│   │   └── Charts.ts      # Chart.js diagrams component
│   ├── services/
│   │   └── dataService.ts # Pure data calculation & analytics engine
│   ├── styles/
│   │   └── main.css       # Show dark theme styling
│   ├── types/
│   │   └── data.ts        # TypeScript data contracts
│   └── main.ts            # Main application entry point
├── tests/
│   ├── dataService.test.ts # Vitest unit tests for analytics
│   ├── ui.test.ts          # JSDOM UI component tests
│   ├── badgesAndCharts.test.ts # JSDOM Badge & Chart.js tests
│   └── test_scraper.py     # Python scraper unit tests
├── index.html             # Single-page HTML template
├── biome.json             # Biome lint/format config
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite & Vitest config
├── CONTEXT.md             # Domain context documentation
├── HANDOFF.md             # Session handoff documentation
└── README.md              # Project documentation
```
