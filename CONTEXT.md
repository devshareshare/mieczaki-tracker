# Mięczaki Tracker — Domain Context

## What is this?

An automated, zero-cost static web application hosted on **GitHub Pages** tracking Instagram follower counts, published post counts, and growth analytics for contestants of the Polish fitness reality show **"Mięczaki"** created by Adam Josef Modzelewski (AJ / [@ajthepolishamerican](https://instagram.com/ajthepolishamerican)).

Contestants undergo a 6-month physical and mental transformation program competing for a 200,000 PLN prize and a contract with AJ's brand OYCHE.

---

## Domain Vocabulary

- **Mięczaki** — "Mollusks" in Polish; the show's name, signifying out-of-shape participants who transform into "twardziele" (tough guys).
- **AJ** — Adam Josef Modzelewski, show creator, coach, and fitness influencer.
- **Contestants** — The 12 participants competing in the show.
- **Podium** — Gold (#1), Silver (#2), and Bronze (#3) top performers display.
- **Goal Milestone** — Unified 100,000 follower target across all contestant progress bars.

---

## Tracked Contestants (12)

| Handle | Name | Nickname |
|---|---|---|
| `pamelka_mieczaki` | Pamela Kiedrowicz | — |
| `pati_mieczaki` | Patrycja Tomaszewska | Pati |
| `filip_mieczaki` | Filip Wrzosek | — |
| `maquk_mieczaki` | Dominik Makowiak | Maquk |
| `stachu_goggins_mieczaki` | Stanisław Dybowski | Stachu |
| `wiktor_mieczaki` | Wiktor Woroniak | — |
| `magda_mieczaki` | Magdalena Majewska | — |
| `dori_mieczaki` | Dorota Kaczmarek | Dori |
| `patrykbutrym_mieczaki` | Patryk Butrym | — |
| `oktawia_mieczaki` | Oktawia Juszczyk | — |
| `oliwia_mieczaki` | Oliwia Płodzień | — |
| `patrycja_mieczaki` | Patrycja Bochyńska | — |

*Note: Host `@mieczaki_aj` and coach `@ajthepolishamerican` accounts are omitted to focus exclusively on contestant rankings.*

---

## Technical Architecture

- **Frontend**: Vite + TypeScript (strict mode) + Chart.js + CSS Variables (lime `#c8ff00` accents on `#121212` dark show theme).
- **Data Engine**: `data/latest.json` (current metrics) + `data/history.json` (daily snapshot log) + `src/services/dataService.ts` (analytics calculations). Tracks followers and posts only.
- **Scraper**: Python 3 (`scripts/scraper.py`) with multi-strategy fallback. Followers are read from the rendered Instagram profile via a headless browser (`agent-browser`) — exact under 10k, 0.1K precision above — with HTTP mirrors (`web_profile_info`, Imginn, `og:description`) as fallback. Posts come from `og:description`. Avatars are static — stored under `public/avatars/` and not refreshed by the scraper.
- **Automation**: A `@reboot` cron job on the host machine runs `scripts/daily-run.sh` at boot — it waits for network, scrapes, then commits and pushes only if the numbers changed. The push triggers `.github/workflows/deploy.yml` (build + deploy to GitHub Pages). No login or terminal is required; the machine just needs to be powered on. Instagram blocks datacenter IPs, so the scrape runs from the host's residential IP rather than GitHub Actions.
