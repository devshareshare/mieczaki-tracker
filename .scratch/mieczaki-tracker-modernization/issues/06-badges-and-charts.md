# 06 — Special Badges & Interactive Chart.js Diagrams

**What to build:**
Implement the special highlight badges (Top Weekly Gainer, Fastest % Growth, Most Active Poster) and interactive Chart.js visualizations (multi-line growth curves over time, monthly followers gained, monthly posts published).

**Blocked by:** 05 — Show-Branded Header, Podium & Contestant Tile Grid

**Status:** closed

## Acceptance criteria

- [x] Special Badges section renders cards for:
  - 🔥 **Top Weekly Gainer**: Contestant with highest absolute follower increase in 7 days.
  - 🚀 **Fastest % Growth**: Contestant with highest percentage growth.
  - 📸 **Most Active Poster**: Contestant with highest total Instagram posts.
- [x] Multi-line follower growth chart rendered using Chart.js with contestant selection toggles and range selectors.
- [x] Monthly Followers Gained bar chart displaying aggregated follower growth per calendar month.
- [x] Monthly Posts Published bar chart displaying aggregated posting frequency per calendar month.
- [x] Charts styled with lime (`#c8ff00`) show branding, dark theme tooltips, and responsive canvas sizing.
- [x] Integration tests verify charts initialize properly when historical data is present or missing.
