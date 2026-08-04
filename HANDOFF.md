# Handoff: Mięczaki Tracker

**Date**: 2026-08-04
**Project**: `/home/krbel/projects/mieczaki-tracker`

## What was built

A locally-hosted Instagram follower tracker (single HTML page at `index.html`) for the Polish fitness reality show "Mięczaki" by AJ (Adam Josef Modzelewski). Shows 12 contestants ranked by Instagram follower count with a podium (top 3), tile grid (ranks 4-12), and flanking profiles for the project (@mieczaki_aj) and coach (@ajthepolishamerican).

## Current state

- **Server**: Running on `http://localhost:8080` via `python3 -m http.server`
- **Page**: Light theme with green (#c8ff00) accents, Bebas Neue header, gold/silver/bronze podium, responsive tile grid
- **Data**: Real follower counts scraped 2026-08-04 via `webfetch` (embedded in JS)
- **Persistence**: `v3` localStorage keys
- **Refresh**: Click refresh → updates "last updated" timestamp only (no data mutation, no fake simulation)
- **No edit mode**: Removed entirely per user request

## Key files

| File | Purpose |
|---|---|
| `index.html` | Main tracker page (905 lines, self-contained) |
| `server.py` | Attempted IG scraper backend (doesn't work — blocked by IG) |
| `CONTEXT.md` | Domain documentation |
| `AGENTS.md` + `docs/agents/` | Matt Pocock skills scaffold |
| `img/` | Downloaded avatars (stale; page uses live IG CDN URLs) |

## Accounts tracked (14 total)

### Contestants (12):
maquk_mieczaki, dori_mieczaki, filip_mieczaki, magda_mieczaki, oktawia_mieczaki, oliwia_mieczaki, pamelka_mieczaki, patrycja_mieczaki, pati_mieczaki, patrykbutrym_mieczaki, stachu_goggins_mieczaki, wiktor_mieczaki

### Project accounts (2):
mieczaki_aj (129K), ajthepolishamerican (717K)

## Scraping situation

- Instagram blocks direct HTTP requests from this machine
- `webfetch` tool (external IP) can scrape og:description meta tags for follower counts
- `server.py` Python backend doesn't work — IG returns login wall
- To refresh data: use `webfetch` on each profile URL, extract `og:description` content, parse follower count

## Open issues / To do

1. **Auto-refresh**: No automated refresh — follower counts are hardcoded. Would need a cron script using webfetch or an Instagram API proxy
2. **Stachu's handle**: Was hard to find — ended up being `stachu_goggins_mieczaki` not `stachu_mieczaki` or `staszek_mieczaki`
3. **Profile pics**: Linked from IG CDN. May expire/break when CDN URLs change
4. **server.py**: Could be fixed by using a proxy service or different scraping approach (Puppeteer/Playwright with Chrome, or a paid API)

## Suggested skills for next session

- `agent-browser` — for visual inspection of the tracker page
- `diagnose` — if scraping needs debugging
- `to-issues` — to create structured tasks from open issues
