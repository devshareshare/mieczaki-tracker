# 04 — Automated GitHub Actions CI/CD Workflow

**What to build:**
Create a GitHub Actions workflow (`.github/workflows/daily-update.yml`) that runs daily on a schedule to execute the Instagram scraper, commit updated data/avatars, run tests, build the Vite static application, and deploy to GitHub Pages.

**Blocked by:** 03 — Instagram Multi-Strategy Scraper & Local Avatar Archiver

**Status:** completed

## Acceptance criteria

- [x] `.github/workflows/daily-update.yml` configured with `schedule` (cron) and `workflow_dispatch` (manual trigger) triggers.
- [x] Workflow runs `python3 scripts/scraper.py` and auto-commits changed files in `data/` and `public/avatars/`.
- [x] Workflow runs `npm run check`, `npm run test`, and `npm run build`.
- [x] Workflow deploys the generated `dist/` directory to GitHub Pages using `actions/deploy-pages`.
- [x] Automated PR validation workflow (`.github/workflows/ci.yml`) set up for testing and linting code changes.
