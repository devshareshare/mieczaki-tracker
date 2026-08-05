# Handoff: Mięczaki Tracker

**Date**: 2026-08-05  
**Project Path**: `/home/nbkbelch/projects/mieczaki-tracker`  
**PRD / Tickets**: `.scratch/mieczaki-tracker-modernization/`  

---

## 1. What Was Built

The legacy single-file tracker was completely modernized into a zero-cost, automated static web application built with **Vite, TypeScript (strict mode), Chart.js, Biome, and Python 3**, deployed automatically to **GitHub Pages**.

### Key Highlights & Features Delivered:
- **Centered Header**: Display title "MIĘCZAKI TRACKER", show subtitle, live status badge, and lime `#c8ff00` accents on dark `#121212` show theme.
- **Top 3 Podium**: Gold (#1), Silver (#2), and Bronze (#3) cards with rank badges, face-zoomed avatars, verified follower counts, published post counts, and milestone progress bars.
- **Contestant Grid**: Ranks 4–12 responsive grid cards with contestant handles, full names, face-zoomed avatars, follower counts, post counts, and milestone progress.
- **Centered Special Badges**:
  - 🔥 **Top Weekly Gainer**: Contestant with the highest absolute follower gain over 7 days.
  - 🚀 **Fastest % Growth**: Contestant with the highest relative percentage growth.
  - 📸 **Most Active Poster**: Contestant with the highest Instagram post output.
- **Interactive Chart.js Diagrams**:
  - **Follower Growth Trajectory**: Multi-line line chart tracking follower trends over time with range selectors (*Wszystko*, *Ostatnie 30 dni*, *Ostatnie 7 dni*) and interactive contestant selection chips.
  - **Monthly Followers Gained**: Bar chart comparing follower growth aggregated by calendar month.
  - **Monthly Posts Published**: Bar chart comparing posts published aggregated by calendar month.
- **Local Avatar Archiving**: High-resolution contestant profile photos stored in `public/avatars/` downloaded directly from `mieczaki.com`.
- **Automated Instagram Scraper**: Python script (`scripts/scraper.py`) with User-Agent rotation, `og:description` parsing, local JPEG caching, and fallback metrics retention.
- **GitHub Actions CI/CD Pipeline**: `.github/workflows/daily-update.yml` cron workflow executing daily at 6 AM UTC to run the scraper, commit updated metrics/avatars, execute tests, build Vite assets, and deploy to **GitHub Pages**.
- **Pure Read-Only UI**: Autopilot execution without manual edit or client-side refresh buttons.

---

## 2. Verified Contestant Metrics

| Rank | Contestant | Handle | Followers | Posts |
|---|---|---|---|---|
| **#1** | Pamela Kiedrowicz | `pamelka_mieczaki` | **33,511** (~33.5k) | **25** |
| **#2** | Patrycja "Pati" Tomaszewska | `pati_mieczaki` | **25,837** (~25.8k) | **15** |
| **#3** | Filip Wrzosek | `filip_mieczaki` | **25,262** (~25.3k) | **30** |
| **#4** | Dominik "Maquk" Makowiak | `maquk_mieczaki` | **23,803** (~23.8k) | **7** |
| **#5** | Stanisław "Stachu" Dybowski | `stachu_goggins_mieczaki` | **19,879** (~19.9k) | **17** |
| **#6** | Wiktor Woroniak | `wiktor_mieczaki` | **19,543** (~19.5k) | **10** |
| **#7** | Magdalena Majewska | `magda_mieczaki` | **16,671** (~16.7k) | **17** |
| **#8** | Dorota "Dori" Kaczmarek | `dori_mieczaki` | **13,118** (~13.1k) | **29** |
| **#9** | Patryk Butrym | `patrykbutrym_mieczaki` | **10,406** (~10.4k) | **16** |
| **#10** | Oktawia Juszczyk | `oktawia_mieczaki` | **8,413** (~8.4k) | **71** |
| **#11** | Oliwia Płodzień | `oliwia_mieczaki` | **4,265** (~4.3k) | **9** |
| **#12** | Patrycja Bochyńska | `patrycja_mieczaki` | **3,873** (~3.9k) | **40** |

---

## 3. Key Files & Directory Map

```text
mieczaki-tracker/
├── .github/workflows/
│   ├── daily-update.yml   # Scheduled daily scraper & GitHub Pages deployment
│   └── ci.yml             # PR and push test validation workflow
├── .scratch/
│   └── mieczaki-tracker-modernization/
│       ├── PRD.md         # Product requirements document
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

---

## 4. How to Verify & Preview

```bash
# Run TypeScript strict type checking
npm run typecheck

# Run Biome linting and formatting check
npm run check

# Run Vitest JS/TS unit & component tests
npm run test

# Run Python scraper unit tests
python3 -m unittest discover tests

# Build static production assets to dist/
npm run build

# Preview build locally
python3 -m http.server 8080 -d dist
```

---

## 5. Suggested Skills for Next Agent Sessions

- `qa` — For interactive QA testing of the deployed GitHub Pages site.
- `code-review` — For automated PR and branch diff reviews.
- `diagnose` — If Instagram scraping behavior needs debugging or proxy tuning.
