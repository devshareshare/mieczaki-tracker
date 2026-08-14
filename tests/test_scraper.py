import os
import sys
import unittest
from pathlib import Path

# Add project root to sys.path so scripts module can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.scraper import (
    get_avatar_path,
    merge_contestant_data,
    parse_count,
    parse_description_text,
    parse_feed_response,
    parse_og_description,
    parse_og_image,
)


class TestScraper(unittest.TestCase):
    def test_parse_count(self):
        self.assertEqual(parse_count("23K"), 23000)
        self.assertEqual(parse_count("23.5K"), 23500)
        self.assertEqual(parse_count("1.2M"), 1200000)
        self.assertEqual(parse_count("8,086"), 8086)
        self.assertEqual(parse_count("145"), 145)
        self.assertEqual(parse_count(""), 0)
        self.assertEqual(parse_count("invalid"), 0)

    def test_parse_description_text(self):
        desc1 = "23K Followers, 41 Following, 7 Posts - See Instagram photos and videos"
        self.assertEqual(parse_description_text(desc1), (23000, 7))

        desc2 = "8,086 Followers, 120 Following, 42 Posts"
        self.assertEqual(parse_description_text(desc2), (8086, 42))

        desc3 = "1.2M Followers, 50 Posts"
        self.assertEqual(parse_description_text(desc3), (1200000, 50))

        self.assertIsNone(parse_description_text("Just some text without stats"))

    def test_parse_og_description(self):
        html1 = """
        <html>
        <head>
          <meta property="og:description" content="25K Followers, 100 Following, 120 Posts - See Instagram photos">
        </head>
        </html>
        """
        self.assertEqual(parse_og_description(html1), (25000, 120))

        html2 = """
        <html>
        <head>
          <meta content="12K Followers, 50 Following, 64 Posts" property="og:description">
        </head>
        </html>
        """
        self.assertEqual(parse_og_description(html2), (12000, 64))

        self.assertIsNone(parse_og_description("<html><body>No meta</body></html>"))

    def test_parse_og_image(self):
        html = """
        <html>
        <head>
          <meta property="og:image" content="https://scontent.cdninstagram.com/avatar.jpg">
        </head>
        </html>
        """
        self.assertEqual(parse_og_image(html), "https://scontent.cdninstagram.com/avatar.jpg")
        self.assertIsNone(parse_og_image("<html></html>"))

    def test_get_avatar_path(self):
        path = get_avatar_path("pamelka_mieczaki", base_dir="/tmp/test_dir")
        self.assertEqual(
            str(path),
            os.path.normpath("/tmp/test_dir/public/avatars/pamelka_mieczaki.jpg"),
        )

    def test_merge_contestant_data_anomaly_guard(self):
        import tempfile

        existing = {
            "id": "stachu_goggins_mieczaki",
            "name": "Stanislaw Dybowski",
            "handle": "stachu_goggins_mieczaki",
            "followers": 19879,
            "posts": 17,
            "comments": 1265,
            "avatar": "/avatars/stachu_goggins_mieczaki.jpg",
            "instagramUrl": "https://www.instagram.com/stachu_goggins_mieczaki/",
        }

        # Mirror returns garbage (240 followers) -> guard must retain previous
        scraped_bad = {
            "handle": "stachu_goggins_mieczaki",
            "followers": 240,
            "posts": 20,
            "comments": None,
            "avatar_url": None,
        }

        with tempfile.TemporaryDirectory() as tmp:
            base_dir = Path(tmp)
            avatar = base_dir / "public" / "avatars" / "stachu_goggins_mieczaki.jpg"
            avatar.parent.mkdir(parents=True, exist_ok=True)
            avatar.write_bytes(b"fake")

            merged = merge_contestant_data(
                existing=existing,
                scraped=scraped_bad,
                handle="stachu_goggins_mieczaki",
                base_dir=base_dir,
                user_agent="TestUA",
            )

        self.assertEqual(merged["followers"], 19879)
        self.assertEqual(merged["posts"], 17)
        self.assertEqual(merged["comments"], 1265)

    def test_parse_feed_response(self):
        data = {
            "items": [
                {"comment_count": 12, "like_count": 100},
                {"comment_count": 5, "like_count": 50},
                {"comment_count": None, "like_count": 20},
            ],
            "user": {"follower_count": 23900, "media_count": 20},
            "next_max_id": "abc123",
            "more_available": True,
        }
        parsed = parse_feed_response(data)
        self.assertEqual(parsed["comments_total"], 17)
        self.assertEqual(parsed["follower_count"], 23900)
        self.assertEqual(parsed["next_max_id"], "abc123")
        self.assertTrue(parsed["more_available"])

    def test_parse_feed_response_empty(self):
        parsed = parse_feed_response({})
        self.assertEqual(parsed["comments_total"], 0)
        self.assertIsNone(parsed["follower_count"])
        self.assertIsNone(parsed["next_max_id"])
        self.assertFalse(parsed["more_available"])

    def test_merge_contestant_data_fallback(self):
        existing = {
            "id": "pamelka_mieczaki",
            "name": "Pamela Kiedrowicz",
            "handle": "pamelka_mieczaki",
            "followers": 33000,
            "posts": 145,
            "comments": 4800,
            "avatar": "/avatars/pamelka_mieczaki.jpg",
            "instagramUrl": "https://www.instagram.com/pamelka_mieczaki/",
        }

        # Case 1: Scrape failed (scraped is None) -> retains previous metrics
        merged_failed = merge_contestant_data(
            existing=existing,
            scraped=None,
            handle="pamelka_mieczaki",
            base_dir=Path("/tmp"),
            user_agent="TestUA",
        )
        self.assertEqual(merged_failed["followers"], 33000)
        self.assertEqual(merged_failed["posts"], 145)
        self.assertEqual(merged_failed["comments"], 4800)

        # Case 2: Scrape succeeded -> updates metrics
        scraped_success = {
            "handle": "pamelka_mieczaki",
            "followers": 33500,
            "posts": 148,
            "comments": 4950,
            "avatar_url": None,
        }
        merged_success = merge_contestant_data(
            existing=existing,
            scraped=scraped_success,
            handle="pamelka_mieczaki",
            base_dir=Path("/tmp"),
            user_agent="TestUA",
        )
        self.assertEqual(merged_success["followers"], 33500)
        self.assertEqual(merged_success["posts"], 148)
        self.assertEqual(merged_success["comments"], 4950)


if __name__ == "__main__":
    unittest.main()
