# 05 — Show-Branded Header, Podium & Contestant Tile Grid

**What to build:**
Develop the core dashboard UI in Vite/TypeScript adhering to the show dark theme (`#121212`) and lime (`#c8ff00`) branding, featuring a centered "Mięczaki Tracker" title, Gold/Silver/Bronze Podium for top 3 contestants, and a responsive Tile Grid for ranks 4–12.

**Blocked by:** 02 — Data Architecture, Data Service Engine & Analytics Computations

**Status:** closed

## Acceptance criteria

- [x] Header renders large centered "Mięczaki Tracker" title with show logo/styling and total aggregate follower stats.
- [x] Top 3 Podium renders Gold (1st), Silver (2nd), and Bronze (3rd) cards with avatar rings, follower counts, post counts, and rank badges.
- [x] Ranks 4-12 Tile Grid renders responsive cards displaying handle, avatar JPEG, follower count, post count, and progress bar to next milestone.
- [x] Pure display UI without any edit or manual refresh buttons.
- [x] Responsive CSS layout tested across desktop, tablet, and mobile viewport sizes.
- [x] Component rendering tests in `tests/ui.test.ts`.
