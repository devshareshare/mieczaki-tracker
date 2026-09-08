# Handoff: Mięczaki Tracker

**Date**: 2026-09-08
**Project Path**: `/home/krbel/projects/mieczaki-tracker`
**Live**: https://devshareshare.github.io/mieczaki-tracker/
**PRD / Tickets**: `.scratch/mieczaki-tracker-modernization/`

---

## TL;DR

Automated zero-cost static tracker for the Polish reality show **Mięczaki** (12 Instagram contestants, follower/post stats), built with Vite + TypeScript + Chart.js, deployed to GitHub Pages via GitHub Actions. Domain context in `CONTEXT.md`, architecture in `README.md`.

Data updates are fully automated: a `@reboot` cron job on this machine scrapes Instagram at boot and pushes, which auto-deploys. Comment stats are no longer tracked. All code is committed and the live site is current.

---

## ⚠️ How data updates work — automated at boot (no manual command)

The tracker refreshes itself when the machine **boots**. There is no `update data` command anymore — just power the machine on.

Mechanism:
- A `@reboot` entry in the user's crontab runs `scripts/daily-run.sh`.
- The script waits for network, runs `python3 scripts/scraper.py`, then commits and pushes **only if the metrics actually changed**.
- The push triggers `.github/workflows/deploy.yml` → build + deploy to GitHub Pages.

The scraper's primary follower source is a headless browser (`agent-browser`) reading the rendered profile (exact under 10k, 0.1K precision above). It needs `agent-browser` installed (`npm i -g agent-browser && agent-browser install`); missing Chrome system libs (`libnspr4`, `libnss3`, `libasound2`) are auto-provisioned to `~/.local/share/mieczaki-tracker/chrome-libs/`. If the browser is unavailable it falls back to HTTP mirrors (less precise).

The "Ostatnia aktualizacja" timestamp only advances when follower/post numbers actually change — so it reflects the real last update, not the last run. Boot logs go to `~/.local/share/mieczaki-tracker/daily-run.log`.

---

## Why not GitHub Actions for the scrape?

Instagram blocks GitHub's datacenter IPs (login wall), so CI scraping is unreliable. Therefore:
- The daily scrape runs from this machine's residential IP via the `@reboot` cron.
- `.github/workflows/daily-update.yml` no longer runs on a schedule (its scrape was committing stale data). It's manual-only (`workflow_dispatch`).
- `.github/workflows/deploy.yml` (push → build → deploy) is the real deployment path.

---

## Recent changes (commits on main)

- **`456269a`** — remove comment stats from UI; show real last-updated date
  - Dropped comments from tiles, podium, monthly charts, `dataService`, and types.
  - Scraper leaves data/timestamp untouched when metrics don't change.
- **`d647fc4`** — automate daily scrape at boot, drop comment scraping
  - Added `scripts/daily-run.sh` + `@reboot` cron job; push triggers deploy.
  - Removed comment fetching (feed API + instaloader) from the scraper — followers + posts only.
  - Disabled the 4 AM CI schedule in `daily-update.yml` (kept `workflow_dispatch`).

---

## Known limitations / watch items

1. **The machine must be powered on** for the boot-triggered scrape. If it's off, no update happens that day — the site just stays on its last data (no stale commits, no conflicts).
2. **Followers need the browser for precision** — the headless-browser strategy reads the rendered count (exact under 10k, 0.1K above). If `agent-browser`/Chrome is unavailable, the scraper falls back to mirrors (Imginn 0.1K, `og:description` whole-K).
3. **Comments are gone** — the scraper no longer fetches them and the UI no longer shows them. The `comments` field may still linger in `data/*.json` from before; it's ignored.
4. `bs4` is an optional runtime dep (guarded by try/except). `instaloader` is no longer used.

---

## Verify

```bash
npm run typecheck     # tsc --noEmit
npm run check         # biome
npm run test          # vitest (25 tests)
python3 -m unittest discover tests   # scraper tests (7)
npm run build         # vite build → dist/
```

Local dev server: `npm run dev` (http://localhost:8080/).

---

## Suggested skills

- `diagnosing-bugs` — if Instagram scraping behavior changes or the browser strategy breaks.
- `agent-browser` — any browser automation work; the CLI is already installed and driving the scraper.
- `qa` — interactive QA of the deployed site.
- `to-spec` / `to-tickets` — for new features.
