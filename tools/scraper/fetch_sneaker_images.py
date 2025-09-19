#!/usr/bin/env python3
"""
Fetch direct, license-friendly image URLs for sneaker models using Wikipedia & Wikimedia Commons APIs.
- Reads: sneakers_100_with_image_columns.csv (columns: Name, Description, ImageURL, License, Source)
- Writes: sneakers_100_images_filled.csv and sneakers_100_images.xlsx
- Downloads images into ./images/ (filenames safe-slugged)
Notes:
  * Prioritizes images under CC-BY/CC-BY-SA/GFDL/CC0 from Commons or pageimages from Wikipedia.
  * Records license + file page source for attribution. Verify licenses before redistribution.
"""

import csv
import os
import re
import sys
import time
import json
import math
import html
from pathlib import Path
from typing import Optional, Tuple, Dict

import requests
from PIL import Image
from io import BytesIO

INPUT_CSV = "output/products.csv"
OUTPUT_CSV = "output/sneakers_with_images.csv"
OUTPUT_XLSX = "output/sneakers_with_images.xlsx"
IMG_DIR = Path("output/images")
IMG_DIR.mkdir(exist_ok=True)

USER_AGENT = "SneakerImageFetcher/1.0 (Education project; contact: local user)"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json"})

WIKI_API = "https://en.wikipedia.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"

ALLOWED_LICENSES = {
    "cc-by", "cc-by-sa", "cc-by-2.0", "cc-by-3.0", "cc-by-4.0",
    "cc-by-sa-2.0", "cc-by-sa-3.0", "cc-by-sa-4.0",
    "cc0", "public domain", "pd", "gfdl", "gfdl-1.2", "gfdl-1.3",
}

def slugify(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text, flags=re.U).strip().lower()
    return re.sub(r"[\s_-]+", "-", text, flags=re.U)

def wiki_search_title(query: str) -> Optional[int]:
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srlimit": 1,
        "format": "json",
    }
    r = SESSION.get(WIKI_API, params=params, timeout=20)
    r.raise_for_status()
    data = r.json()
    hits = data.get("query", {}).get("search", [])
    if not hits:
        return None
    return hits[0].get("pageid")

def wiki_pageimage_url(pageid: int) -> Optional[str]:
    params = {
        "action": "query",
        "pageids": pageid,
        "prop": "pageimages",
        "piprop": "original",
        "format": "json",
    }
    r = SESSION.get(WIKI_API, params=params, timeout=20)
    r.raise_for_status()
    data = r.json()
    pages = data.get("query", {}).get("pages", {})
    page = pages.get(str(pageid), {})
    original = page.get("original")
    if original and "source" in original:
        return original["source"]
    return None

def commons_find_file(name: str) -> Optional[Dict]:
    # search file namespace for the model name
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": name,
        "gsrlimit": 5,
        "gsrnamespace": 6,  # File namespace
        "prop": "imageinfo",
        "iiprop": "url|extmetadata",
        "format": "json",
    }
    r = SESSION.get(COMMONS_API, params=params, timeout=20)
    r.raise_for_status()
    data = r.json()
    pages = data.get("query", {}).get("pages", {})
    # choose first file with an allowed license and decent size
    best = None
    best_area = 0
    for _, p in pages.items():
        infos = p.get("imageinfo", [])
        if not infos:
            continue
        info = infos[0]
        url = info.get("url")
        md = info.get("extmetadata", {})

        # License normalization
        license_short = (md.get("LicenseShortName", {}).get("value") or "").lower()
        usage_terms = (md.get("UsageTerms", {}).get("value") or "").lower()
        license_url = md.get("LicenseUrl", {}).get("value") or ""
        credit = html.unescape(md.get("Credit", {}).get("value") or "")
        artist = html.unescape(md.get("Artist", {}).get("value") or "")
        license_name = license_short or usage_terms or "unknown"

        # filter licenses
        ok = False
        for token in ALLOWED_LICENSES:
            if token in license_name:
                ok = True
                break
        if not ok:
            continue

        width = int(md.get("ImageWidth", {}).get("value") or info.get("width") or 0)
        height = int(md.get("ImageHeight", {}).get("value") or info.get("height") or 0)
        area = width * height
        if area > best_area:
            best_area = area
            best = {
                "url": url,
                "license": license_name,
                "license_url": license_url,
                "source": f"https://commons.wikimedia.org/wiki/{p.get('title', '').replace(' ', '_')}",
                "credit": credit or artist,
                "width": width,
                "height": height,
            }
    return best

def download_image(url: str, out_path: Path) -> Optional[Path]:
    try:
        r = SESSION.get(url, timeout=30)
        r.raise_for_status()
        img = Image.open(BytesIO(r.content))
        img_format = (img.format or "JPEG").lower()
        # normalize extension
        ext = ".jpg" if img_format in ("jpeg", "jpg") else f".{img_format}"
        final_path = out_path.with_suffix(ext)
        img.save(final_path)
        return final_path
    except Exception as e:
        print(f"[warn] Failed to download {url}: {e}")
        return None

def find_image_for_model(name: str) -> Tuple[Optional[str], Optional[str], Optional[str], Optional[str]]:
    """
    Returns (image_url, license, license_url, source_page_url) or (None, None, None, None)
    """
    # 1) Try Wikipedia pageimage
    pageid = wiki_search_title(name)
    if pageid:
        url = wiki_pageimage_url(pageid)
        if url:
            # Wikipedia pageimages are usually from Commons but may lack explicit license metadata;
            # still acceptable if the underlying file on Commons is licensed. We'll record Wikipedia as source.
            return url, "see-source", "", f"https://en.wikipedia.org/?curid={pageid}"

    # 2) Try Commons direct
    best = commons_find_file(name)
    if best:
        return best["url"], best["license"], best["license_url"], best["source"]

    # 3) Last attempt: loosen query (remove brand keywords)
    tokens = [t for t in re.split(r"[^\w]+", name) if t]
    if len(tokens) > 2:
        loose = " ".join(tokens[-2:])
        best = commons_find_file(loose)
        if best:
            return best["url"], best["license"], best["license_url"], best["source"]

    return None, None, None, None

def main():
    rows = []
    with open(INPUT_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            rows.append(row)

    print(f"Processing {len(rows)} sneaker models...")
    
    for i, row in enumerate(rows, 1):
        name = row["Name"]
        if row.get("ImageURL"):
            continue
        print(f"[{i}/{len(rows)}] Searching image for: {name}")
        img_url, lic, lic_url, src = find_image_for_model(name)
        row["ImageURL"] = img_url or ""
        row["License"] = lic or ""
        row["Source"] = src or ""
        # polite rate limiting
        time.sleep(0.6)

    # Save CSV
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    print(f"Done. Wrote {OUTPUT_CSV}")

if __name__ == "__main__":
    main()

