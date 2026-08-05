Status: ready-for-agent

# PRD: Mięczaki Tracker Modernization & Automation

## Problem Statement

The current "Mięczaki Tracker" is a single unmodularized HTML file (`index.html`) with hardcoded follower counts, stale image links pointing to Instagram CDN, and a broken local Python scraping script (`server.py`). The page requires manual editing and lacks automated updates, automated deployment to free hosting (GitHub Pages), historical statistics, post count tracking, and visual growth analytics.

## Solution

A modernized, automated, zero-cost static web application hosted on GitHub Pages. Built with Vite, TypeScript, and Chart.js, the application features an official show-branded dark theme (lime `#c8ff00` accents) with a Podium for top 3 contestants, a Grid for ranks 4-12, performance badges (Top Gainer, Fastest Growth, Most Active Poster), and interactive monthly growth and post statistics diagrams. A daily GitHub Actions workflow automatically scrapes Instagram follower and post counts, caches profile avatars locally, appends records to time-series JSON files, and deploys the updated static site seamlessly.

## User Stories

1. As a fan of the Mięczaki reality show, I want to view a centered "Mięczaki Tracker" dashboard on GitHub Pages, so that I can easily monitor contestant standings.
2. As a visitor, I want to see a Gold, Silver, and Bronze Podium displaying the top 3 contestants by follower count, so that I immediately know who is leading.
3. As a visitor, I want to view a responsive tile grid for contestants ranked 4th through 12th, so that I can see everyone's current followers and post counts.
4. As an analyst, I want to see a "Top Weekly Gainer" highlight badge, so that I know which contestant gained the most total followers in the last 7 days.
5. As an analyst, I want to see a "Fastest % Growth" highlight badge, so that I know who is growing fastest relative to their starting follower count.
6. As a fan, I want to see a "Most Active Poster" badge, so that I can identify which contestant is producing the most Instagram content.
7. As a visitor, I want to see "Next Milestone" progress bars on contestant cards, so that I can track their progress toward targets like 10k, 25k, 50k, or 100k followers.
8. As a user viewing charts, I want an interactive line chart showing follower growth over time with multi-contestant toggles, so that I can compare trajectories across custom time ranges.
9. As a user analyzing monthly performance, I want a bar chart comparing followers gained by specific calendar months, so that I can review monthly trends.
10. As a user tracking content activity, I want a bar chart showing posts published by specific calendar months, so that I can compare posting frequency per month.
11. As a mobile user, I want the layout and charts to be fully responsive on smartphones and tablets, so that I can check the tracker on any device.
12. As a site visitor, I want avatar images to load reliably without broken Instagram CDN links, so that profile photos always display properly.
13. As a maintainer, I want follower and post counts to be updated automatically every day via GitHub Actions without manual intervention or client-side refresh buttons, so that the site runs continuously on autopilot.
14. As a developer, I want a modular TypeScript architecture with Vite, Biome linting, and Vitest test suites, so that the codebase is robust, maintainable, and reliable.

## Implementation Decisions

- **Tracked Accounts Scope**: Exclusively track the 12 show contestants (`maquk_mieczaki`, `dori_mieczaki`, `filip_mieczaki`, `magda_mieczaki`, `oktawia_mieczaki`, `oliwia_mieczaki`, `pamelka_mieczaki`, `patrycja_mieczaki`, `pati_mieczaki`, `patrykbutrym_mieczaki`, `stachu_goggins_mieczaki`, `wiktor_mieczaki`). Show and coach accounts (`@mieczaki_aj` and `@ajthepolishamerican`) are removed from tracking.
- **Frontend Stack**: Vite + TypeScript + Chart.js + CSS Variables for lime `#c8ff00` and dark show theme (`#121212`).
- **Data Architecture**:
  - `data/latest.json`: Current snapshot holding rankings, follower counts, post counts, and avatar paths.
  - `data/history.json`: Array of daily historical snapshots (`timestamp`, `contestants: [{ handle, followers, posts }]`).
  - `public/avatars/`: Locally downloaded contestant avatar JPEGs stored in the repo/build output.
- **Scraper & CI/CD Engine**: Python 3 script (`scripts/scraper.py`) executed daily via `.github/workflows/daily-update.yml`:
  - Scrapes follower and post counts using `og:description` meta tags with user-agent rotation and fallback handling.
  - Downloads updated avatar JPEGs to `public/avatars/` when changed.
  - Appends daily data entry to `data/history.json` and updates `data/latest.json`.
  - Commits updated data files and triggers Vite static build + GitHub Pages deployment.
- **Automated Display**: No client-side "Refresh" or "Edit" buttons exist in the UI; the interface is strictly read-only.

## Testing Decisions

- Tests focus exclusively on observable behavior and data transformation contracts.
- **Unit Tests (`tests/dataService.test.ts`)**: Validate data parsing, rank sorting, badge calculations (Top Gainer, Fastest Growth, Most Active Poster), and monthly chart data aggregation against `latest.json` and `history.json` schemas.
- **Scraper Tests (`tests/test_scraper.py`)**: Validate regex extraction logic for `og:description` string formats and fallback JSON handling.
- **Component Render Tests (`tests/ui.test.ts`)**: Validate that Podium, TileGrid, and Badges components produce correct DOM structures and handle missing/zero data gracefully.

## Out of Scope

- Client-side manual edit or refresh controls.
- Tracking show host `@mieczaki_aj` or coach `@ajthepolishamerican`.
- Database storage requiring external paid or cloud services.
- Real-time minute-by-minute streaming updates (daily updates are sufficient).

## Further Notes

- The site uses zero paid APIs or infrastructure. Hosting is 100% free via GitHub Pages and GitHub Actions.
