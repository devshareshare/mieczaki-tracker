# Mięczaki Tracker

Instagram follower tracker for the Polish fitness reality show **"Mięczaki"** created by Adam Josef Modzelewski (AJ / [@ajthepolishamerican](https://instagram.com/ajthepolishamerican)). Tracks follower counts of 12 contestants competing in a 6-month physical/mental transformation program with a €200K prize.

## Live Tracker

Open `index.html` in a browser or serve locally:

```bash
python3 -m http.server 8080
# Then open http://localhost:8080
```

## Features

- **Podium** — Top 3 contestants in gold/silver/bronze styling
- **Tile grid** — Ranks 4–12 with profile pictures and follower counts
- **Flanking profiles** — Project account (@mieczaki_aj) and coach (@ajthepolishamerican) on sides
- **Refresh button** — Updates the "last updated" timestamp
- **Responsive** — Works on mobile and desktop
- **Light theme** — Green (#c8ff00) accents, Bebas Neue font

## Contestants (12)

| Handle | Name | Nickname |
|---|---|---|
| [@maquk_mieczaki](https://instagram.com/maquk_mieczaki) | Dominik Makowiak | Maquk |
| [@dori_mieczaki](https://instagram.com/dori_mieczaki) | Dorota Kaczmarek | Dori |
| [@filip_mieczaki](https://instagram.com/filip_mieczaki) | Filip Wrzosek | — |
| [@magda_mieczaki](https://instagram.com/magda_mieczaki) | Magdalena Majewska | — |
| [@oktawia_mieczaki](https://instagram.com/oktawia_mieczaki) | Oktawia Juszczyk | — |
| [@oliwia_mieczaki](https://instagram.com/oliwia_mieczaki) | Oliwia Płodzień | — |
| [@pamelka_mieczaki](https://instagram.com/pamelka_mieczaki) | Pamela Kiedrowicz | — |
| [@patrycja_mieczaki](https://instagram.com/patrycja_mieczaki) | Patrycja Bochyńska | — |
| [@pati_mieczaki](https://instagram.com/pati_mieczaki) | Patrycja Tomaszewska | Pati |
| [@patrykbutrym_mieczaki](https://instagram.com/patrykbutrym_mieczaki) | Patryk Butrym | — |
| [@stachu_goggins_mieczaki](https://instagram.com/stachu_goggins_mieczaki) | Stanisław Dybowski | Stachu |
| [@wiktor_mieczaki](https://instagram.com/wiktor_mieczaki) | Wiktor Woroniak | — |

## Data Source

Follower counts are scraped from Instagram `og:description` meta tags. Instagram blocks direct HTTP requests from residential IPs, so the data is updated manually via external scraping tools. The `server.py` backend exists as a work-in-progress attempt to automate this.

## Known Limitations

- **Data is manual** — Follower counts must be updated by hand via `webfetch` or similar tooling
- **`server.py` incomplete** — Instagram blocks the Python backend; would need a proxy service, Puppeteer/Playwright, or a paid API
- **Profile picture CDN links may expire** — Images link directly to Instagram's CDN

## Tech Stack

- Single-page HTML/CSS/JS (`index.html`)
- Python HTTP server (`server.py`) — WIP
- No build tools, no dependencies

## Project Structure

```
├── index.html      # Main tracker page (self-contained)
├── server.py       # Python scraper backend (WIP)
├── img/            # Cached profile pictures (stale)
├── CONTEXT.md      # Domain documentation
└── docs/           # Agent skill definitions
```
