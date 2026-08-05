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
- **Special Badges** — Weekly highlight cards for *Top Weekly Gainer*, *Fastest Weekly % Growth*, *Most Active Weekly Poster*, and *Most Discussed Weekly Poster*.
- **Goal Milestone** — Unified 50,000 follower target across all contestant progress bars.
- **Comment Metrics** — Aggregated comment totals across contestants' published posts.

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
- **Data Engine**: `data/latest.json` (current metrics) + `data/history.json` (daily snapshot log) + `src/services/dataService.ts` (analytics calculations).
- **Scraper & Avatars**: Python 3 (`scripts/scraper.py`) with User-Agent rotation, `og:description` parsing, local JPEG caching under `public/avatars/`, and high-res fallbacks from `mieczaki.com`.
- **CI/CD Autopilot**: GitHub Actions workflow (`.github/workflows/daily-update.yml`) runs daily at 6:00 AM UTC to scrape Instagram, update JSON & avatars, execute tests, build Vite assets, and deploy to GitHub Pages.
