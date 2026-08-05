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

    def test_merge_contestant_data_fallback(self):
        existing = {
            "id": "pamelka_mieczaki",
            "name": "Pamela Kiedrowicz",
            "handle": "pamelka_mieczaki",
            "followers": 33000,
            "posts": 145,
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

        # Case 2: Scrape succeeded -> updates metrics
        scraped_success = {
            "handle": "pamelka_mieczaki",
            "followers": 33500,
            "posts": 148,
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


if __name__ == "__main__":
    unittest.main()
