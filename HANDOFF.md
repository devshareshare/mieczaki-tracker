# Handoff: Mięczaki Tracker

**Date**: 2026-08-14  
**Project Path**: `/home/krbel/projects/mieczaki-tracker`  
**PRD / Tickets**: `.scratch/mieczaki-tracker-modernization/`  

---

## 1. What Was Built

The legacy single-file tracker was completely modernized into a zero-cost, automated static web application built with **Vite, TypeScript (strict mode), Chart.js, Biome, and Python 3**, deployed automatically to **GitHub Pages**.

### Key Highlights & Features Delivered:
- **Centered Header**: Display title "MIĘCZAKI TRACKER", show subtitle ("Fanowski ranking..."), live status badge, last updated widget, and lime `#c8ff00` accents on dark `#121212` show theme.
- **Top 3 Podium**: Gold (#1), Silver (#2), and Bronze (#3) cards with rank badges, face-zoomed avatars, verified follower counts, published post counts, and milestone progress bars.
- **Contestant Grid**: Ranks 4–12 responsive grid cards with contestant handles, full names, face-zoomed avatars, follower counts, post counts, and milestone progress.
- **Centered Special Weekly Badges**:
  - 🔥 **Top Weekly Gainer**: Contestant with the highest absolute follower gain over 7 days.
  - 🚀 **Fastest Weekly % Growth**: Contestant with the highest relative percentage growth over 7 days.
  - 📸 **Most Active Weekly Poster**: Contestant with the highest Instagram post output over 7 days.
  - 💬 **Most Discussed Weekly Poster**: Contestant with the highest comment gain across posts over 7 days (centered on row 2).
- **Unified 50,000 Milestone Goal**: All contestant progress bars benchmark against a shared 50,000 follower target.
- **Comment Metrics & Analytics**:
  - `comments` tracking added to `latest.json`, `history.json`, and contestant cards in Podium & Grid.
  - 💬 **Monthly Comments Gained**: Bar chart comparing comment gains aggregated by calendar month.
  - Scraper (`scripts/scraper.py`) and GitHub Actions workflow updated to automatically scrape comment counts daily.
- **Mobile Responsive Podium Order**: Fixed `@media (max-width: 900px)` rules so Gold (#1) card renders at the top on single-column mobile viewports.
- **Interactive Chart.js Diagrams**:
  - **Follower Growth Trajectory**: Multi-line line chart tracking follower trends over time with range selectors (*Wszystko*, *Ostatnie 30 dni*, *Ostatnie 7 dni*) and interactive contestant selection chips.
  - **Monthly Followers Gained**: Bar chart comparing follower growth aggregated by calendar month.
  - **Monthly Posts Published**: Bar chart comparing posts published aggregated by calendar month.
- **Local Avatar Archiving**: High-resolution contestant profile photos stored in `public/avatars/` downloaded directly from `mieczaki.com`.
- **Automated Instagram Scraper**: Python script (`scripts/scraper.py`) with User-Agent rotation, `og:description` parsing, local JPEG caching, and fallback metrics retention.
- **GitHub Actions CI/CD Pipeline**: `.github/workflows/daily-update.yml` cron workflow executing daily at 4 AM UTC (and on push) to run the scraper, commit updated metrics/avatars, execute tests, build Vite assets with `base: '/mieczaki-tracker/'`, and deploy to **GitHub Pages**.
- **Pure Read-Only UI**: Autopilot execution without manual edit or client-side refresh buttons.

---

## 2. Verified Contestant Metrics

| Rank | Contestant | Handle | Followers | Posts | Comments |
|---|---|---|---|---|---|
| **#1** | Pamela Kiedrowicz | `pamelka_mieczaki` | **33,511** (~33.5k) | **25** | **2,125** |
| **#2** | Patrycja "Pati" Tomaszewska | `pati_mieczaki` | **25,837** (~25.8k) | **15** | **1,711** |
| **#3** | Filip Wrzosek | `filip_mieczaki` | **25,262** (~25.3k) | **30** | **1,863** |
| **#4** | Dominik "Maquk" Makowiak | `maquk_mieczaki` | **23,803** (~23.8k) | **7** | **1,295** |
| **#5** | Stanisław "Stachu" Dybowski | `stachu_goggins_mieczaki` | **19,879** (~19.9k) | **17** | **1,265** |
| **#6** | Wiktor Woroniak | `wiktor_mieczaki` | **19,543** (~19.5k) | **10** | **1,207** |
| **#7** | Magdalena Majewska | `magda_mieczaki` | **16,671** (~16.7k) | **17** | **1,241** |
| **#8** | Dorota "Dori" Kaczmarek | `dori_mieczaki` | **13,118** (~13.1k) | **29** | **1,612** |
| **#9** | Patryk Butrym | `patrykbutrym_mieczaki` | **10,406** (~10.4k) | **16** | **856** |
| **#10** | Oktawia Juszczyk | `oktawia_mieczaki` | **8,413** (~8.4k) | **71** | **1,982** |
| **#11** | Oliwia Płodzień | `oliwia_mieczaki` | **4,265** (~4.3k) | **9** | **474** |
| **#12** | Patrycja Bochyńska | `patrycja_mieczaki` | **3,873** (~3.9k) | **40** | **1,393** |

---

## 3. How to Verify & Preview

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

## 4. Suggested Skills for Next Agent Sessions

- `qa` — For interactive QA testing of the deployed GitHub Pages site.
- `code-review` — For automated PR and branch diff reviews.
- `diagnose` — If Instagram scraping behavior needs debugging or proxy tuning.

---

## 5. Recent Fixes (2026-08-14)

- **Scraper hardening**: follower anomaly guard (reject >50% 1-day drop) + sanity floor (reject `followers < 1000`) so mirror garbage (e.g. a 240-follower glitch) can't corrupt data.
- **Exact followers + comments, no login**: `web_profile_info` gives exact follower counts; comments are summed anonymously via `api/v1/feed/user/{id}` (replaces the broken instaloader path).
- **Avatar fix**: non-square images (e.g. a 640×1136 photo) are rejected and fall back to official `mieczaki.com` square avatars.
- **Badge math**: "Most Active" and "Most Discussed" weekly badges no longer fall back to lifetime totals when 7-day gain is zero.
- **Daily deploy fixed**: `daily-update.yml` now runs the full scrape → test → build → deploy pipeline in one workflow. Previously the deploy never ran on daily auto-commits because `GITHUB_TOKEN` pushes don't re-trigger the separate `deploy.yml` (site was frozen at Aug 6).
