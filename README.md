# Mięczaki Tracker

Automated Instagram follower and post count tracker for the Polish fitness reality show **"Mięczaki"** created by Adam Josef Modzelewski (AJ / [@ajthepolishamerican](https://instagram.com/ajthepolishamerican)). 

Tracks 12 contestants competing in a 6-month physical/mental transformation program for a 200,000 PLN prize and an OYCHE contract.

---

## 🚀 Live Site & Autopilot Deployment

The application is deployed automatically to **GitHub Pages**. A daily GitHub Actions workflow (`.github/workflows/daily-update.yml`) runs on a schedule at 6:00 AM UTC to:
1. Scrape Instagram follower and post counts for all 12 contestants using `scripts/scraper.py`.
2. Cache profile avatar images locally under `public/avatars/` (falling back to high-resolution official photos from `mieczaki.com`).
3. Append timestamped snapshot records to `data/history.json` and update `data/latest.json`.
4. Run Biome checks, TypeScript type checks, and Vitest + Python unit test suites.
5. Build the Vite application and deploy the static site to GitHub Pages.

---

## ✨ Features

- **Centered Show Header**: Clean display title, show subtitle, and live status badge with lime `#c8ff00` accents on dark `#121212` show theme.
- **Top 3 Podium**: Gold (#1, center/highest on desktop, #1 top on mobile), Silver (#2, left), and Bronze (#3, right) cards featuring rank badges, face-zoomed avatars, verified follower counts, post counts, total comments, and unified 50,000 follower milestone progress bars.
- **Contestant Grid**: Ranks 4 through 12 cards displaying full names, handles, face-zoomed avatars, follower counts, post counts, comment totals, and unified 50,000 follower milestone progress bars.
- **Centered Weekly Special Badges**:
  - 🔥 **Top Weekly Gainer**: Highlights the contestant who gained the most followers in the last 7 days.
  - 🚀 **Fastest Weekly % Growth**: Highlights the contestant with the highest percentage growth in the last 7 days.
  - 📸 **Most Active Weekly Poster**: Highlights the contestant with the highest post output in the last 7 days.
  - 💬 **Most Discussed Weekly Poster**: Highlights the contestant who gained the most comments across all posts in the last 7 days (centered on 2nd row).
- **Interactive Chart.js Diagrams**:
  - **Follower Growth Trajectory**: Multi-line line chart tracking follower trends over time with range selectors (*Wszystko*, *Ostatnie 30 dni*, *Ostatnie 7 dni*) and interactive contestant selection chips.
  - **Monthly Followers Gained**: Bar chart comparing follower growth aggregated by calendar month.
  - **Monthly Posts Published**: Bar chart comparing posts published aggregated by calendar month.
  - **Monthly Comments Gained**: Bar chart comparing total comments gained aggregated by calendar month.
- **Local Avatar Archiving**: High-resolution contestant photos stored in `public/avatars/` to guarantee zero broken Instagram CDN links.
- **Pure Read-Only UI**: Runs on autopilot without manual edit or client-side refresh buttons.

---

## 👥 Tracked Contestants (12)

| Rank | Handle | Name | Followers | Posts |
|---|---|---|---|---|
| **#1** | [@pamelka_mieczaki](https://instagram.com/pamelka_mieczaki) | Pamela Kiedrowicz | 33,511 (~33.5k) | 25 |
| **#2** | [@pati_mieczaki](https://instagram.com/pati_mieczaki) | Patrycja "Pati" Tomaszewska | 25,837 (~25.8k) | 15 |
| **#3** | [@filip_mieczaki](https://instagram.com/filip_mieczaki) | Filip Wrzosek | 25,262 (~25.3k) | 30 |
| **#4** | [@maquk_mieczaki](https://instagram.com/maquk_mieczaki) | Dominik "Maquk" Makowiak | 23,803 (~23.8k) | 7 |
| **#5** | [@stachu_goggins_mieczaki](https://instagram.com/stachu_goggins_mieczaki) | Stanisław "Stachu" Dybowski | 19,879 (~19.9k) | 17 |
| **#6** | [@wiktor_mieczaki](https://instagram.com/wiktor_mieczaki) | Wiktor Woroniak | 19,543 (~19.5k) | 10 |
| **#7** | [@magda_mieczaki](https://instagram.com/magda_mieczaki) | Magdalena Majewska | 16,671 (~16.7k) | 17 |
| **#8** | [@dori_mieczaki](https://instagram.com/dori_mieczaki) | Dorota "Dori" Kaczmarek | 13,118 (~13.1k) | 29 |
| **#9** | [@patrykbutrym_mieczaki](https://instagram.com/patrykbutrym_mieczaki) | Patryk Butrym | 10,406 (~10.4k) | 16 |
| **#10** | [@oktawia_mieczaki](https://instagram.com/oktawia_mieczaki) | Oktawia Juszczyk | 8,413 (~8.4k) | 71 |
| **#11** | [@oliwia_mieczaki](https://instagram.com/oliwia_mieczaki) | Oliwia Płodzień | 4,265 (~4.3k) | 9 |
| **#12** | [@patrycja_mieczaki](https://instagram.com/patrycja_mieczaki) | Patrycja Bochyńska | 3,873 (~3.9k) | 40 |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Vite + TypeScript (strict mode) + Chart.js + CSS Variables (dark theme `#121212`, lime accent `#c8ff00`).
- **Data Engine**:
  - `data/latest.json`: Current snapshot holding rankings, follower counts, post counts, and local avatar paths.
  - `data/history.json`: Time-series log containing daily snapshots.
  - `src/services/dataService.ts`: Pure computation module for sorting, badge calculations, progress milestones, and monthly aggregations.
- **Scraper Script**: Python 3 (`scripts/scraper.py`) with User-Agent rotation, `og:description` parsing, local JPEG caching, and fallback metrics retention.
- **CI/CD Pipelines**:
  - `.github/workflows/daily-update.yml`: Scheduled daily scraper execution & GitHub Pages deployment.
  - `.github/workflows/ci.yml`: Pull request and push test/typecheck validation.
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
│   ├── daily-update.yml   # Scheduled daily scraper & GitHub Pages deployment
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
│   └── scraper.py         # Instagram scraper & avatar archiver script
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
