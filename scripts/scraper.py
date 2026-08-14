#!/usr/bin/env python3
"""Instagram multi-strategy scraper and local avatar archiver for Mięczaki Tracker."""

import json
import random
import re
import ssl
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

SSL_CONTEXT = ssl._create_unverified_context()
HTTP_TIMEOUT = 8  # strict timeout in seconds
MIN_PLAUSIBLE_FOLLOWERS = 1000  # reject mirror garbage below this as a glitch

# Mobile (iPad) app identifiers used by the anonymous api/v1/feed endpoint.
MOBILE_APP_ID = "124024574287414"
IPAD_USER_AGENT = (
    "Instagram 361.0.0.35.82 (iPad13,8; iOS 18_0; en_US; en-US; "
    "scale=2.00; 2048x2732; 674117118) AppleWebKit/420+"
)
MAX_FEED_PAGES = 3  # cap comment pagination at ~3 pages (≈ 99 posts)

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

GOOGLEBOT_USER_AGENT = (
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
)


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
    """Parse description text into (followers, posts)."""
    if not desc:
        return None

    f_match = re.search(r"([\d,.\s]+[KM]?)\s*Followers?\b(?!ing)", desc, re.IGNORECASE)
    p_match = re.search(r"([\d,.\s]+[KM]?)\s*Posts?\b", desc, re.IGNORECASE)

    if f_match and p_match:
        followers = parse_count(f_match.group(1))
        posts = parse_count(p_match.group(1))
        return (followers, posts)

    match = re.search(
        r"([\d,.\s]+[KM]?)\s+Followers?,?\s*[\d,.\s]+[KM]?\s+Following,?\s*([\d,.\s]+[KM]?)\s+Posts?",
        desc,
        re.IGNORECASE,
    )
    if not match:
        match = re.search(
            r"([\d,.\s]+[KM]?)\s+Followers?,?\s*([\d,.\s]+[KM]?)\s+Posts?",
            desc,
            re.IGNORECASE,
        )

    if match:
        followers = parse_count(match.group(1))
        posts = parse_count(match.group(2))
        return (followers, posts)

    return None


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


def fetch_url(url: str, headers: dict, timeout: int = HTTP_TIMEOUT) -> str | None:
    """Fetch URL with timeout and return response text or None if error."""
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout, context=SSL_CONTEXT) as resp:
            if resp.status == 200:
                return resp.read().decode("utf-8", errors="replace")
    except Exception:
        pass
    return None


def parse_feed_response(data: dict) -> dict:
    """Extract comment total + pagination info from a mobile feed API response."""
    total = 0
    for item in data.get("items") or []:
        cc = item.get("comment_count")
        if isinstance(cc, int) and cc > 0:
            total += cc
    return {
        "comments_total": total,
        "follower_count": data.get("user", {}).get("follower_count"),
        "next_max_id": data.get("next_max_id") or data.get("max_id"),
        "more_available": bool(data.get("more_available")),
    }


def fetch_comments_feed(user_id: str | int | None) -> int | None:
    """Sum comment counts over a user's posts via the anonymous mobile feed endpoint."""
    if not user_id:
        return None
    headers = {
        "User-Agent": IPAD_USER_AGENT,
        "x-ig-app-id": MOBILE_APP_ID,
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
    }
    total = 0
    max_id = None
    for _ in range(MAX_FEED_PAGES):
        params = [("count", "33")]
        if max_id:
            params.append(("max_id", max_id))
        qs = "&".join(f"{k}={v}" for k, v in params)
        url = f"https://www.instagram.com/api/v1/feed/user/{user_id}/?{qs}"
        raw = fetch_url(url, headers)
        if not raw:
            break
        try:
            data = json.loads(raw)
        except Exception:
            break
        parsed = parse_feed_response(data)
        total += parsed["comments_total"]
        max_id = parsed["next_max_id"]
        if not max_id or not parsed["more_available"]:
            break
    return total if total > 0 else None


def fetch_comments_instaloader(handle: str, timeout: int = 5) -> int | None:
    """Attempt to fetch comment count using instaloader with timeout."""
    try:
        import socket
        import instaloader

        socket.setdefaulttimeout(timeout)
        L = instaloader.Instaloader(max_connection_attempts=1)
        L.context._session.verify = False
        L.context.max_connection_attempts = 1
        profile = instaloader.Profile.from_username(L.context, handle)
        total_comments = 0
        posts_counted = 0
        for post in profile.get_posts():
            total_comments += getattr(post, "comments", 0)
            posts_counted += 1
            if posts_counted >= 30:
                break
        return total_comments
    except Exception:
        return None


# Strategy 1: Instagram Web API
def strategy_1_instagram_api(handle: str, user_agent: str) -> dict | None:
    """Strategy 1: Instagram Web API."""
    url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={handle}"
    headers = {
        "User-Agent": user_agent,
        "X-IG-App-ID": "936619743392459",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
    }
    raw = fetch_url(url, headers)
    if not raw:
        return None

    try:
        data = json.loads(raw)
        user = data.get("data", {}).get("user")
        if user:
            followers = user.get("edge_followed_by", {}).get("count")
            posts = user.get("edge_owner_to_timeline_media", {}).get("count")
            avatar_url = user.get("profile_pic_url_hd") or user.get("profile_pic_url")
            user_id = user.get("id")
            if followers is not None and posts is not None:
                return {
                    "followers": int(followers),
                    "posts": int(posts),
                    "avatar_url": avatar_url,
                    "user_id": user_id,
                }
    except Exception:
        pass
    return None


# Strategy 2: Picuki Public Mirror
def strategy_2_picuki(handle: str, user_agent: str) -> dict | None:
    """Strategy 2: Picuki public mirror."""
    url = f"https://www.picuki.com/profile/{handle}"
    headers = {
        "User-Agent": user_agent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,pl;q=0.8",
    }
    html = fetch_url(url, headers)
    if not html:
        return None

    stats = parse_og_description(html)
    followers, posts = stats if stats else (None, None)
    avatar_url = parse_og_image(html)

    if (followers is None or posts is None) and BeautifulSoup:
        try:
            soup = BeautifulSoup(html, "html.parser")
            if followers is None:
                fol_el = soup.find(class_=re.compile(r"followed_by|followers", re.I))
                if fol_el:
                    followers = parse_count(fol_el.get_text())
                else:
                    m = re.search(r"([\d,.\s]+[KM]?)\s*followers", html, re.I)
                    if m:
                        followers = parse_count(m.group(1))

            if posts is None:
                post_el = soup.find(class_=re.compile(r"total_posts|posts", re.I))
                if post_el:
                    posts = parse_count(post_el.get_text())
                else:
                    m = re.search(r"([\d,.\s]+[KM]?)\s*posts", html, re.I)
                    if m:
                        posts = parse_count(m.group(1))

            if not avatar_url:
                img_el = soup.find(
                    "div", class_=re.compile(r"profile-avatar|profile-spec-image|profile-image", re.I)
                )
                if img_el:
                    sub_img = img_el.find("img")
                    if sub_img:
                        src = sub_img.get("src")
                        if isinstance(src, str):
                            avatar_url = src
        except Exception:
            pass

    if followers is not None and posts is not None:
        return {
            "followers": followers,
            "posts": posts,
            "avatar_url": avatar_url,
        }
    return None


# Strategy 3: Imginn Public Mirror
def strategy_3_imginn(handle: str, user_agent: str) -> dict | None:
    """Strategy 3: Imginn public mirror."""
    url = f"https://imginn.com/{handle}/"
    headers = {
        "User-Agent": user_agent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }
    html = fetch_url(url, headers)
    if not html:
        return None

    stats = parse_og_description(html)
    followers, posts = stats if stats else (None, None)
    avatar_url = parse_og_image(html)

    if (followers is None or posts is None) and BeautifulSoup:
        try:
            soup = BeautifulSoup(html, "html.parser")
            if followers is None:
                m = re.search(r"([\d,.\s]+[KM]?)\s*followers", html, re.I)
                if m:
                    followers = parse_count(m.group(1))
            if posts is None:
                m = re.search(r"([\d,.\s]+[KM]?)\s*posts", html, re.I)
                if m:
                    posts = parse_count(m.group(1))
            if not avatar_url:
                img_el = soup.find("div", class_=re.compile(r"img|avatar|profile", re.I))
                if img_el:
                    sub_img = img_el.find("img")
                    if sub_img:
                        src = sub_img.get("src")
                        if isinstance(src, str):
                            avatar_url = src
        except Exception:
            pass

    if followers is not None and posts is not None:
        return {
            "followers": followers,
            "posts": posts,
            "avatar_url": avatar_url,
        }
    return None


# Strategy 4: Dumpor Public Mirror
def strategy_4_dumpor(handle: str, user_agent: str) -> dict | None:
    """Strategy 4: Dumpor public mirror."""
    url = f"https://dumpor.com/v/{handle}"
    headers = {
        "User-Agent": user_agent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }
    html = fetch_url(url, headers)
    if not html:
        return None

    stats = parse_og_description(html)
    followers, posts = stats if stats else (None, None)
    avatar_url = parse_og_image(html)

    if (followers is None or posts is None) and BeautifulSoup:
        try:
            soup = BeautifulSoup(html, "html.parser")
            if followers is None:
                m = re.search(r"([\d,.\s]+[KM]?)\s*followers", html, re.I)
                if m:
                    followers = parse_count(m.group(1))
            if posts is None:
                m = re.search(r"([\d,.\s]+[KM]?)\s*posts", html, re.I)
                if m:
                    posts = parse_count(m.group(1))
            if not avatar_url:
                img_el = soup.find("img", alt=re.compile(r"avatar|profile|user", re.I))
                if img_el:
                    src = img_el.get("src")
                    if isinstance(src, str):
                        avatar_url = src
        except Exception:
            pass

    if followers is not None and posts is not None:
        return {
            "followers": followers,
            "posts": posts,
            "avatar_url": avatar_url,
        }
    return None


# Strategy 5: OpenGraph Meta Tag Scraping
def strategy_5_opengraph_googlebot(handle: str) -> dict | None:
    """Strategy 5: OpenGraph meta tag scraping using Googlebot User-Agent."""
    url = f"https://www.instagram.com/{handle}/"
    headers = {
        "User-Agent": GOOGLEBOT_USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }
    html = fetch_url(url, headers)
    if not html:
        return None

    stats = parse_og_description(html)
    avatar_url = parse_og_image(html)

    if stats:
        followers, posts = stats
        return {
            "followers": followers,
            "posts": posts,
            "avatar_url": avatar_url,
        }
    return None


def get_avatar_path(handle: str, base_dir: Path | str | None = None) -> Path:
    """Return local avatar file path for a contestant handle."""
    if base_dir is None:
        base_dir = Path(__file__).resolve().parent.parent
    else:
        base_dir = Path(base_dir)
    return base_dir / "public" / "avatars" / f"{handle}.jpg"


def _jpeg_dimensions(data: bytes) -> tuple[int, int] | None:
    """Return (width, height) for a JPEG, or None if not a valid JPEG."""
    if len(data) < 9 or data[:2] != b"\xff\xd8":
        return None
    i = 2
    while i + 9 < len(data):
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
            height = (data[i + 5] << 8) | data[i + 6]
            width = (data[i + 7] << 8) | data[i + 8]
            return width, height
        if marker == 0xD8 or marker == 0x01 or 0xD0 <= marker <= 0xD9:
            i += 2
            continue
        i += 2 + ((data[i + 2] << 8) | data[i + 3])
    return None


def download_avatar(url: str, dest_path: Path, user_agent: str) -> bool:
    """Download JPEG profile image from URL and save to dest_path."""
    if not url:
        return False
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": user_agent,
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            },
        )
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT, context=SSL_CONTEXT) as resp:
            data = resp.read()
            if data and len(data) > 100:
                dims = _jpeg_dimensions(data)
                if dims:
                    width, height = dims
                    ratio = max(width, height) / max(1, min(width, height))
                    if ratio > 1.5:
                        print(
                            f"[avatar] Skipping non-square avatar for {dest_path.stem} ({width}x{height}).",
                            file=sys.stderr,
                        )
                        return False
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                with open(dest_path, "wb") as f:
                    f.write(data)
                return True
    except Exception as e:
        print(f"[avatar] Error downloading avatar for {dest_path.stem}: {e}", file=sys.stderr)
    return False


def fetch_instagram_profile(handle: str, user_agent: str | None = None) -> dict | None:
    """Fetch contestant profile using multi-strategy fallbacks."""
    ua = user_agent or get_random_user_agent()

    # Imginn mirror exposes precise counts ("27.1K"), while Instagram's own
    # og:description rounds to whole K ("27K") and the Web API is login-walled.
    # Order: exact API -> precise mirror -> rounded official -> remaining mirrors.
    strategies = [
        ("Strategy 1: Instagram Web API", lambda: strategy_1_instagram_api(handle, ua)),
        ("Strategy 3: Imginn public mirror", lambda: strategy_3_imginn(handle, ua)),
        ("Strategy 5: OpenGraph Googlebot", lambda: strategy_5_opengraph_googlebot(handle)),
        ("Strategy 2: Picuki public mirror", lambda: strategy_2_picuki(handle, ua)),
        ("Strategy 4: Dumpor public mirror", lambda: strategy_4_dumpor(handle, ua)),
    ]

    scraped_result = None
    successful_strategy = None

    for name, strategy_fn in strategies:
        try:
            res = strategy_fn()
            followers = res.get("followers") if res else None
            posts = res.get("posts") if res else None
            if (
                res
                and isinstance(followers, int)
                and followers >= MIN_PLAUSIBLE_FOLLOWERS
                and isinstance(posts, int)
                and posts > 0
            ):
                scraped_result = res
                successful_strategy = name
                print(f"[scraper] {handle}: Success via {name}")
                break
            else:
                print(
                    f"[scraper] {handle}: {name} returned incomplete data. Trying next strategy...",
                    file=sys.stderr,
                )
        except Exception as e:
            print(
                f"[scraper] {handle}: {name} failed: {e}. Trying next strategy...",
                file=sys.stderr,
            )

    if not scraped_result:
        print(
            f"[scraper] {handle}: All strategies failed to fetch fresh metrics.",
            file=sys.stderr,
        )
        return None

    result = {
        "handle": handle,
        "followers": scraped_result["followers"],
        "posts": scraped_result["posts"],
        "avatar_url": scraped_result.get("avatar_url"),
        "strategy": successful_strategy,
    }

    comments = fetch_comments_feed(scraped_result.get("user_id"))
    if comments is None:
        comments = fetch_comments_instaloader(handle)
    if comments is not None:
        result["comments"] = comments

    return result


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
            "comments": 0,
            "avatar": f"./avatars/{handle}.jpg",
            "instagramUrl": f"https://www.instagram.com/{handle}/",
        }

    updated = dict(existing)
    if "comments" not in updated:
        updated["comments"] = 0

    avatar_path = get_avatar_path(handle, base_dir)
    avatar_success = False

    if scraped and scraped.get("followers") is not None and scraped.get("posts") is not None:
        new_followers = int(scraped["followers"])
        prev_followers = int(updated.get("followers", 0) or 0)

        # Anomaly guard: reject implausible follower drops (>50% in one day)
        # as mirror/parse garbage instead of corrupting the dataset.
        if prev_followers > 0 and new_followers < prev_followers * 0.5:
            print(
                f"[guard] {handle}: implausible follower drop {prev_followers} -> {new_followers}. Retaining previous metrics.",
                file=sys.stderr,
            )
        else:
            updated["followers"] = new_followers
            updated["posts"] = scraped["posts"]

            if scraped.get("comments") is not None:
                updated["comments"] = scraped["comments"]

            avatar_url = scraped.get("avatar_url")
            if avatar_url:
                avatar_success = download_avatar(avatar_url, avatar_path, user_agent)
    else:
        print(
            f"[fallback] Retaining previous metrics for {handle}: followers={updated.get('followers')}, posts={updated.get('posts')}, comments={updated.get('comments')}"
        )

    # Ensure avatar exists; if missing or download failed, fallback to official mieczaki avatar
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
                "comments": merged.get("comments", 0),
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
        f.write("\n")
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
        f.write("\n")
    print(f"[scraper] Saved history snapshot to {history_file}")


if __name__ == "__main__":
    run_scraper()

