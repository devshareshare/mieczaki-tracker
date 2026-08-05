# 02 — Data Architecture, Data Service Engine & Analytics Computations

**What to build:**
Create the initial JSON data files (`data/latest.json` and `data/history.json`) for the 12 show contestants and build a unit-tested `dataService.ts` module that loads, validates, ranks, and aggregates follower and post statistics.

**Blocked by:** 01 — Project Foundation & Vite/TypeScript Setup

**Status:** completed

## Acceptance criteria

- [x] `data/latest.json` created with initial baseline metrics for all 12 contestants.
- [x] `data/history.json` created with initial historical entries.
- [x] TypeScript interfaces defined for `Contestant`, `LatestSnapshot`, and `HistorySnapshot`.
- [x] `src/services/dataService.ts` implemented with:
  - Ranking calculation (sorted by followers descending)
  - Badge computation: Top Weekly Gainer, Fastest % Growth, Most Active Poster
  - Progress milestone calculation (e.g. towards 10k, 25k, 50k, 100k)
  - Monthly aggregation logic for follower growth and posts published by calendar month
- [x] Vitest unit tests in `tests/dataService.test.ts` covering all dataService computations.
