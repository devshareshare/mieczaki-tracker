#!/usr/bin/env python3
"""Instagram multi-strategy scraper and local avatar archiver for Mięczaki Tracker."""

import json
import random
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

CONTESTANT_HANDLES = [
    "maquk_mieczaki",
    "dori_mieczaki",
    "filip_mieczaki",
    "magda_mieczaki",
    "oktawia_mieczaki",
    "oliwia_mieczaki",
    "pamelka_mieczaki",
    "patrycja_mieczaki",
    "pati_mieczaki",
    "patrykbutrym_mieczaki",
    "stachu_goggins_mieczaki",
    "wiktor_mieczaki",
]

OFFICIAL_MIECZAKI_AVATARS = {
    "maquk_mieczaki": "https://mieczaki.com/wp-content/uploads/2026/05/Dominik-Makowiak.jpg",
    "dori_mieczaki": "https://mieczaki.com/wp-content/uploads/2026/05/DOROTA_KACZMAREK_.jpg",
    "filip_mieczaki": "https://mieczaki.com/wp-content/uploads/2026/05/Filip-Wrzosek.jpg",
    "magda_mieczaki": "https://mieczaki.com/wp-content/uploads/2026/05/Magdalena-Majewska.jpg",
    "oktawia_mieczaki": "https://mieczaki.com/wp-content/uploads/2026/05/OKTAWIA_JUSZCZYK.jpg",
    "oliwia_mieczaki": "https://mieczaki.com/wp-content/uploads/2026/05/OLIWIA_PLODZIEN.jpg",
    "pamelka_mieczaki": "https://mieczaki.com/wp-content/uploads/2026/05/PAMELA_KIEDROWICZ.jpg",
    "patrycja_mieczaki": "https://mieczaki.com/wp-content/uploads/2026/05/PATRYCJA_BOCHYNSKA.jpg",
    "pati_mieczaki": "https://mieczaki.com/wp-content/uploads/2026/05/PATRYCJA_TOMASZEWSKA.jpg",
    "patrykbutrym_mieczaki": "https://mieczaki.com/wp-content/uploads/2026/05/PATRYK_BUTRYM.jpg",
    "stachu_goggins_mieczaki": "https://mieczaki.com/wp-content/uploads/2026/05/STANISLAW_DYBOWSKI.jpg",
    "wiktor_mieczaki": "https://mieczaki.com/wp-content/uploads/2026/05/WIKTOR_WORONIAK.jpg",
}

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
]


def get_random_user_agent() -> str:
    """Return a random User-Agent header string."""
    return random.choice(USER_AGENTS)


def parse_count(raw: str) -> int:
    """Parse number strings like '23K', '8,086', '1.2M', '1 234' into an integer."""
    if not raw:
        return 0
    cleaned = raw.strip().upper().replace(",", "").replace(" ", "")
    if cleaned.endswith("M"):
        try:
            return int(float(cleaned[:-1]) * 1_000_000)
        except ValueError:
            return 0
    if cleaned.endswith("K"):
        try:
            return int(float(cleaned[:-1]) * 1_000)
        except ValueError:
            return 0
    try:
        return int(float(cleaned))
    except ValueError:
        return 0


def parse_description_text(desc: str) -> tuple[int, int] | None:
    """Parse '23K Followers, 41 Following, 7 Posts' into (followers, posts)."""
    if not desc:
        return None

    # Pattern 1: <followers> Followers, <following> Following, <posts> Posts
    match = re.search(
        r"([\d,.\s]+[KM]?)\s+Followers?,?\s*[\d,.\s]+[KM]?\s+Following,?\s*([\d,.\s]+[KM]?)\s+Posts?",
        desc,
        re.IGNORECASE,
    )
    if not match:
        # Pattern 2: <followers> Followers, <posts> Posts
        match = re.search(
            r"([\d,.\s]+[KM]?)\s+Followers?,?\s*([\d,.\s]+[KM]?)\s+Posts?",
            desc,
            re.IGNORECASE,
        )

    if not match:
        return None

    followers = parse_count(match.group(1))
    posts = parse_count(match.group(2))
    return (followers, posts)


def parse_og_description(html: str) -> tuple[int, int] | None:
    """Extract (followers, posts) from HTML meta og:description tag."""
    if not html:
        return None

    pattern = r'<meta\s+(?:[^>]*?\b(?:property|name)=["\'](?:og:description|description)["\'][^>]*?\bcontent=["\']([^"\']+)["\']|[^>]*?\bcontent=["\']([^"\']+)["\'][^>]*?\b(?:property|name)=["\'](?:og:description|description)["\'])'
    m = re.search(pattern, html, re.IGNORECASE)
    if not m:
        return None

    desc = m.group(1) or m.group(2)
    return parse_description_text(desc)


def parse_og_image(html: str) -> str | None:
    """Extract image URL from HTML meta property='og:image'."""
    if not html:
        return None

    pattern = r'<meta\s+(?:[^>]*?\bproperty=["\']og:image["\'][^>]*?\bcontent=["\']([^"\']+)["\']|[^>]*?\bcontent=["\']([^"\']+)["\'][^>]*?\bproperty=["\']og:image["\'])'
    m = re.search(pattern, html, re.IGNORECASE)
    if m:
        return m.group(1) or m.group(2)
    return None


def get_avatar_path(handle: str, base_dir: Path | str | None = None) -> Path:
    """Return local avatar file path for a contestant handle."""
    if base_dir is None:
        base_dir = Path(__file__).resolve().parent.parent
    else:
        base_dir = Path(base_dir)
    return base_dir / "public" / "avatars" / f"{handle}.jpg"


def download_avatar(url: str, dest_path: Path, user_agent: str) -> bool:
    """Download JPEG profile image from URL and save to dest_path."""
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": user_agent,
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            },
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if data and len(data) > 100:
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                with open(dest_path, "wb") as f:
                    f.write(data)
                return True
    except Exception as e:
        print(f"[avatar] Error downloading avatar for {dest_path.stem}: {e}", file=sys.stderr)
    return False


def fetch_instagram_profile(handle: str, user_agent: str | None = None) -> dict | None:
    """Fetch profile HTML and extract followers, posts, and avatar URL."""
    url = f"https://www.instagram.com/{handle}/"
    ua = user_agent or get_random_user_agent()
    headers = {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pl-PL,pl;q=0.9,en-US;q=0.8",
    }

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"[scrape] {handle}: HTTP/Network error: {e}", file=sys.stderr)
        return None

    stats = parse_og_description(html)
    if not stats:
        print(f"[scrape] {handle}: Could not parse stats from og:description", file=sys.stderr)
        return None

    followers, posts = stats
    og_image = parse_og_image(html)

    return {
        "handle": handle,
        "followers": followers,
        "posts": posts,
        "avatar_url": og_image,
    }


def merge_contestant_data(
    existing: dict | None,
    scraped: dict | None,
    handle: str,
    base_dir: Path,
    user_agent: str,
) -> dict:
    """Merge scraped data with existing contestant data, applying fallback logic."""
    if not existing:
        existing = {
            "id": handle,
            "name": handle,
            "handle": handle,
            "followers": 0,
            "posts": 0,
            "avatar": f"/avatars/{handle}.jpg",
            "instagramUrl": f"https://www.instagram.com/{handle}/",
        }

    updated = dict(existing)

    avatar_path = get_avatar_path(handle, base_dir)
    avatar_success = False

    if scraped and scraped.get("followers") is not None and scraped.get("posts") is not None:
        updated["followers"] = scraped["followers"]
        updated["posts"] = scraped["posts"]

        avatar_url = scraped.get("avatar_url")
        if avatar_url:
            avatar_success = download_avatar(avatar_url, avatar_path, user_agent)
    else:
        print(
            f"[fallback] Retaining previous metrics for {handle}: followers={updated.get('followers')}, posts={updated.get('posts')}"
        )

    # Ensure avatar exists; if missing or scrape failed, use official mieczaki.com avatar
    if not avatar_success or not avatar_path.exists():
        official_url = OFFICIAL_MIECZAKI_AVATARS.get(handle)
        if official_url:
            download_avatar(official_url, avatar_path, user_agent)

    return updated


def run_scraper(project_root: Path | str | None = None) -> None:
    """Run scraper for all 12 contestants, updating data/latest.json and data/history.json."""
    if project_root is None:
        root = Path(__file__).resolve().parent.parent
    else:
        root = Path(project_root)

    latest_file = root / "data" / "latest.json"
    history_file = root / "data" / "history.json"

    # Load existing latest.json
    existing_latest = {}
    if latest_file.exists():
        try:
            with open(latest_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                for c in data.get("contestants", []):
                    existing_latest[c["handle"]] = c
        except Exception as e:
            print(f"[warning] Error reading {latest_file}: {e}", file=sys.stderr)

    now_iso = datetime.now(timezone.utc).isoformat()
    today_date = now_iso[:10]

    updated_contestants = []
    history_entry_contestants = []

    for handle in CONTESTANT_HANDLES:
        ua = get_random_user_agent()
        scraped = fetch_instagram_profile(handle, user_agent=ua)
        existing = existing_latest.get(handle)
        merged = merge_contestant_data(existing, scraped, handle, root, ua)

        updated_contestants.append(merged)
        history_entry_contestants.append(
            {
                "handle": handle,
                "followers": merged["followers"],
                "posts": merged["posts"],
            }
        )

    # Save latest.json
    latest_payload = {
        "timestamp": now_iso,
        "contestants": updated_contestants,
    }
    latest_file.parent.mkdir(parents=True, exist_ok=True)
    with open(latest_file, "w", encoding="utf-8") as f:
        json.dump(latest_payload, f, ensure_ascii=False, indent=2)
    print(f"[scraper] Saved updated metrics to {latest_file}")

    # Load and update history.json
    history_list = []
    if history_file.exists():
        try:
            with open(history_file, "r", encoding="utf-8") as f:
                history_list = json.load(f)
        except Exception as e:
            print(f"[warning] Error reading {history_file}: {e}", file=sys.stderr)

    new_history_entry = {
        "timestamp": now_iso,
        "contestants": history_entry_contestants,
    }

    # Replace today's entry if already present, otherwise append
    replaced = False
    for i, snap in enumerate(history_list):
        if snap.get("timestamp", "")[:10] == today_date:
            history_list[i] = new_history_entry
            replaced = True
            break

    if not replaced:
        history_list.append(new_history_entry)

    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history_list, f, ensure_ascii=False, indent=2)
    print(f"[scraper] Saved history snapshot to {history_file}")


if __name__ == "__main__":
    run_scraper()
