#!/usr/bin/env bash
# Mięczaki Tracker — boot-time daily refresh.
#
# Runs at machine boot via a `@reboot` cron entry (residential IP, which
# Instagram allows). Scrapes followers + posts for all 12 contestants, then
# commits and pushes. The push triggers the GitHub Pages deploy workflow.
#
# No comments are scraped. No terminal / login is required — just power on.
set -uo pipefail

# cron's minimal PATH won't include nvm's node (agent-browser lives there).
export PATH="/home/krbel/.nvm/versions/node/v24.16.0/bin:/usr/local/bin:/usr/bin:/bin"
export HOME="/home/krbel"

PROJECT_ROOT="/home/krbel/projects/mieczaki-tracker"
LOG_DIR="$HOME/.local/share/mieczaki-tracker"
LOG_FILE="$LOG_DIR/daily-run.log"
mkdir -p "$LOG_DIR"

log() { echo "[$(date '+%F %T')] $*"; }

{
  log "=== daily run start ==="
  cd "$PROJECT_ROOT" || { log "FATAL: cannot cd to $PROJECT_ROOT"; exit 1; }

  # Wait for network (Instagram reachable) up to ~10 minutes.
  log "waiting for network..."
  online=0
  code=""
  for _ in $(seq 1 120); do
    code=$(curl -s -m 5 -o /dev/null -w '%{http_code}' https://www.instagram.com/ 2>/dev/null || true)
    case "$code" in
      200|301|302) online=1; break ;;
    esac
    sleep 5
  done
  if [ "$online" -ne 1 ]; then
    log "FATAL: no network after 10 min; aborting."
    exit 1
  fi
  log "network up (instagram HTTP $code)."

  # Sync with remote first, so a machine that was off for a while doesn't
  # overwrite newer history. (Normally a no-op — nothing else writes.)
  git fetch --quiet origin || true
  git pull --rebase --quiet origin main 2>/dev/null || git rebase --abort 2>/dev/null || true

  # Scrape (browser-first). Always rewrites data/latest.json + data/history.json.
  log "scraping..."
  python3 scripts/scraper.py
  log "scrape done."

  # Commit + push only if data actually changed.
  if git diff --quiet data/latest.json data/history.json; then
    log "no data change; nothing to push."
  else
    git add data/latest.json data/history.json
    git commit --quiet -m "auto: daily Instagram data refresh (boot)"
    if ! git push origin main 2>/dev/null; then
      # Remote advanced (e.g. an earlier run pushed) — rebase, favoring our
      # fresh local scrape on any data conflict.
      log "push rejected; rebasing onto remote (favoring fresh data)."
      git pull --rebase --quiet origin main 2>/dev/null || true
      git checkout --theirs -- data/latest.json data/history.json 2>/dev/null || true
      git add data/latest.json data/history.json
      GIT_EDITOR=true git rebase --continue 2>/dev/null || true
      git push origin main
    fi
    log "pushed."
  fi

  log "=== daily run end ==="
} >> "$LOG_FILE" 2>&1
