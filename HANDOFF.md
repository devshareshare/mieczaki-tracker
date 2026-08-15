# Handoff: Mięczaki Tracker

**Date**: 2026-08-14
**Project Path**: `/home/krbel/projects/mieczaki-tracker`
**Live**: https://devshareshare.github.io/mieczaki-tracker/
**PRD / Tickets**: `.scratch/mieczaki-tracker-modernization/`

---

## TL;DR

Automated zero-cost static tracker for the Polish reality show **Mięczaki** (12 Instagram contestants, follower/post/comment stats), built with Vite + TypeScript + Chart.js, deployed to GitHub Pages via GitHub Actions. Domain context in `CONTEXT.md`, architecture in `README.md`, ADRs/docs under `docs/`.

All code is committed and the live site is current as of 2026-08-14.

---

## ⚠️ "update data" command — most important

The daily 4 AM UTC CI run **cannot reliably scrape** — Instagram blocks GitHub's datacenter IP (all 6 scraper strategies return incomplete data there, including the browser). The user refreshes data manually.

**When the user says "update data", do exactly this:**

```bash
cd /home/krbel/projects/mieczaki-tracker
python3 scripts/scraper.py          # scrapes from residential IP (works)
git add data/latest.json data/history.json
git commit -m "auto: daily Instagram data refresh (local)"
git push origin main                # triggers deploy.yml → actions/deploy-pages
```

The push auto-deploys. Verify at https://devshareshare.github.io/mieczaki-tracker/ ("Ostatnia aktualizacja" should show today's date).

The scraper's primary follower source is a headless browser (`agent-browser`). It needs `agent-browser` installed (`npm i -g agent-browser && agent-browser install`); missing Chrome system libs (`libnspr4`, `libnss3`, `libasound2`) are auto-provisioned to `~/.local/share/mieczaki-tracker/chrome-libs/`. If the browser is unavailable, it falls back to HTTP mirrors (less precise).

Note: if the push rejects as non-fast-forward (CI committed data in between), run `git pull --rebase origin main`, resolve data-file conflicts **in favor of the local scrape** (`git checkout --theirs data/`), then `git rebase --continue` and push.

---

## Recent fixes (commits on main)

- **`b168217`** — scraper hardening + badge math + self-contained daily workflow:
  - follower anomaly guard (reject >50% 1-day drop) + sanity floor (`followers >= 1000`) so mirror garbage can't corrupt data
  - non-square avatar rejection (fixed Pamela's tall 640×1136 photo)
  - anonymous comment fetch via `api/v1/feed/user/{id}` + exact followers via `web_profile_info`
  - weekly "most active/discussed" badges no longer fall back to lifetime totals
- **`7137a8a`** — docs update (README/CONTEXT/HANDOFF)
- **`2995a80`** — switched deploy to official `actions/deploy-pages` (the gh-pages branch force-push was being ignored because Pages `build_type: workflow`)
- **`fa1fc09`** — refreshed data (local scrape)

---

## Known limitations / watch items

1. **CI scraping is blocked** (datacenter IP). The daily run stays green but *retains previous data* when all strategies fail. See the "update data" section above.
2. **Comments depend on fallback paths** — the `api/v1/feed/user/{id}` comment endpoint needs a `user_id` from `web_profile_info` (blocked on CI), so comment totals come from `instaloader`/mirrors and may be retained from the previous run when those fail.
3. **Followers need the browser for precision** — the headless-browser strategy (`agent-browser`) reads the rendered count (exact under 10k, 0.1K above). If agent-browser/Chrome is unavailable, the scraper falls back to mirrors (Imginn 0.1K, `og:description` whole-K).
4. `bs4`/`instaloader` are optional runtime deps (guarded by try/except); CI installs them, local may not have them.

---

## Verify

```bash
npm run typecheck     # tsc --noEmit
npm run check         # biome
npm run test          # vitest (25 tests)
python3 -m unittest discover tests   # scraper tests (9)
npm run build         # vite build → dist/
```

Local dev server: `npm run dev` (http://localhost:8080/).

---

## Suggested skills

- `code-review` — review the scraper + dataService changes
- `diagnosing-bugs` — if Instagram scraping behavior needs debugging (blocked strategies)
- `qa` — interactive QA of the deployed site
- `to-spec` / `to-tickets` — if new features are planned
