#!/usr/bin/env python3
"""Mieczaki Tracker - HTTP server with Instagram scraper backend.
Serves index.html and proxies Instagram profile data via og:description meta tags.
"""

import http.server
import json
import re
import urllib.request
import urllib.parse
import os
import sys
from pathlib import Path

DIR = Path(__file__).parent

# Instagram scraping uses og:description which is publicly accessible
# with proper User-Agent and headers
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/149.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pl-PL,pl;q=0.9,en-US;q=0.8",
}


def parse_follower_count(raw: str) -> int:
    """Parse '23K', '8,086', '1.2M' etc into an integer."""
    raw = raw.strip().upper().replace(",", "").replace(" ", "")
    if raw.endswith("M"):
        return int(float(raw[:-1]) * 1_000_000)
    if raw.endswith("K"):
        return int(float(raw[:-1]) * 1_000)
    try:
        return int(raw)
    except ValueError:
        return 0


def scrape_instagram(handle: str) -> dict | None:
    """Scrape Instagram profile page for og:description metadata."""
    url = f"https://www.instagram.com/{handle}/"
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"[scrape] {handle}: error={e}", file=sys.stderr)
        return None

    # Extract og:description:  "23K Followers, 41 Following, 7 Posts - ..."
    m = re.search(
        r'<meta\s+[^>]*property="og:description"[^>]*content="([^"]*)"',
        html,
    )
    if not m:
        print(f"[scrape] {handle}: no og:description found", file=sys.stderr)
        return None

    desc = m.group(1)
    # Parse: "12K Followers, 123 Following, 28 Posts - See Instagram photos..."
    match = re.match(
        r"([\d,]+[KM]?)\s+Followers?,\s*([\d,]+[KM]?)\s+Following,?\s*([\d,]+[KM]?)\s+Posts?",
        desc,
    )
    if not match:
        print(f"[scrape] {handle}: couldn't parse: {desc[:80]}", file=sys.stderr)
        return None

    followers = parse_follower_count(match.group(1))
    following = parse_follower_count(match.group(2))
    posts = parse_follower_count(match.group(3))

    # Extract full name from og:title or og:description
    # og:title: "Dorota Kaczmarek (@dori_mieczaki) • Instagram..."
    name_match = re.search(r'content="([^"(]+)\s*\(@', html)
    if not name_match:
        # Fallback: extract from description: "...from Dorota Kaczmarek (@handle)"
        name_match = re.search(r"from\s+(.+?)\s*\(@", desc)

    full_name = name_match.group(1).strip() if name_match else ""

    return {
        "handle": handle,
        "followers": followers,
        "following": following,
        "posts": posts,
        "full_name": full_name,
    }


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIR), **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/refresh" or parsed.path == "/api/refresh-all":
            params = urllib.parse.parse_qs(parsed.query)
            handles = params.get("handles", params.get("handle", []))
            if not handles and parsed.path == "/api/refresh-all":
                # Default: all contestants
                handles = [
                    "maquk_mieczaki", "dori_mieczaki", "filip_mieczaki",
                    "magda_mieczaki", "oktawia_mieczaki", "oliwia_mieczaki",
                    "pamelka_mieczaki", "patrycja_mieczaki", "pati_mieczaki",
                    "patrykbutrym_mieczaki", "stachu_mieczaki", "wiktor_mieczaki",
                    "mieczaki_aj", "ajthepolishamerican",
                ]
            elif not handles:
                handles = params.get("handle", [])
                if not handles:
                    self._json({"error": "no handles specified"}, 400)
                    return

            # Flatten list if passed as comma-separated
            if len(handles) == 1 and "," in handles[0]:
                handles = handles[0].split(",")

            results = []
            for h in handles[:16]:  # limit
                data = scrape_instagram(h.strip())
                if data:
                    results.append(data)
                else:
                    results.append({"handle": h.strip(), "error": "failed"})

            self._json({"updated_at": str(self.date_time_string()), "accounts": results})

        elif parsed.path == "/api/stachu":
            # Special endpoint: try both possible handles for Stachu
            results = []
            for h in ["stachu_mieczaki", "staszek_mieczaki"]:
                data = scrape_instagram(h)
                if data:
                    results.append(data)
                    break
            if results:
                self._json({"found": True, "account": results[0]})
            else:
                self._json({"found": False, "error": "Stachu profile not accessible"})

        else:
            super().do_GET()

    def _json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    server = http.server.HTTPServer(("0.0.0.0", port), Handler)
    print(f"Mieczaki Tracker running on http://localhost:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.server_close()
