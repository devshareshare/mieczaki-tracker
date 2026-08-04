# Mięczaki Tracker — Domain Context

## What is this?

A locally-hosted Instagram follower tracker for the Polish fitness reality show **"Mięczaki"** created by Adam Josef Modzelewski (AJ / @ajthepolishamerican). The project tracks follower counts of the 12 contestants competing in a 6-month physical/mental transformation program, with a €200K prize.

## Key concepts

- **Mięczaki** — "mollusks" in Polish; the show's name, implying soft/out-of-shape participants who transform into "twardziele" (tough guys)
- **AJ** — Adam Josef Modzelewski, creator/coach, Polish-American fitness YouTuber
- **Contestants** — 12 participants living together, undergoing fitness transformations
- **Podium** — Top 3 by Instagram followers displayed as gold/silver/bronze

## Project components

- `index.html` — Single-page tracker with podium, tile grid, and flanking project/coach profiles
- `server.py` — Python HTTP server (attempted IG scraper backend — blocked by Instagram)
- `img/` — Downloaded profile pictures (stale; page uses live IG CDN URLs now)

## Contestants (12)

| Handle | Name | Nickname |
|---|---|---|
| maquk_mieczaki | Dominik Makowiak | Maquk |
| dori_mieczaki | Dorota Kaczmarek | Dori |
| filip_mieczaki | Filip Wrzosek | — |
| magda_mieczaki | Magdalena Majewska | — |
| oktawia_mieczaki | Oktawia Juszczyk | — |
| oliwia_mieczaki | Oliwia Płodzień | — |
| pamelka_mieczaki | Pamela Kiedrowicz | — |
| patrycja_mieczaki | Patrycja Bochyńska | — |
| pati_mieczaki | Patrycja Tomaszewska | Pati |
| patrykbutrym_mieczaki | Patryk Butrym | — |
| stachu_goggins_mieczaki | Stanisław Dybowski | Stachu |
| wiktor_mieczaki | Wiktor Woroniak | — |

## Project accounts

- @mieczaki_aj — Official project account
- @ajthepolishamerican — AJ's personal/coach account

## Data source

Follower counts are scraped from Instagram og:description meta tags via the `webfetch` tool. Direct scraping from this machine is blocked by Instagram's anti-bot protection.

## How to run

```bash
python3 -m http.server 8080 --directory /home/krbel/projects/mieczaki-tracker
```

Then open http://localhost:8080
