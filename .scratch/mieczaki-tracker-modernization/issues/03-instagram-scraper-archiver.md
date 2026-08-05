# 03 — Instagram Multi-Strategy Scraper & Local Avatar Archiver

**What to build:**
Create a Python 3 automated scraping script (`scripts/scraper.py`) that fetches Instagram follower and post counts for all 12 contestants, caches profile pictures locally in `public/avatars/`, and appends new daily entries to `data/history.json` and `data/latest.json`.

**Blocked by:** 02 — Data Architecture, Data Service Engine & Analytics Computations

**Status:** completed

## Acceptance criteria

- [x] `scripts/scraper.py` parses `og:description` meta tags with user-agent rotation and fallback handling for rate limits or login walls.
- [x] Scraper extracts follower counts and post counts for each of the 12 contestant handles.
- [x] Scraper downloads/updates avatar JPEG files into `public/avatars/<handle>.jpg` to ensure image reliability.
- [x] Scraper updates `data/latest.json` and appends a timestamped snapshot to `data/history.json`.
- [x] Python tests (`tests/test_scraper.py` via `pytest` or `unittest`) verify regex parsing and fallback logic.
