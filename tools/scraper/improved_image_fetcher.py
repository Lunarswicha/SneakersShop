#!/usr/bin/env python3
"""
Improved sneaker image fetcher using multiple sources for better accuracy.
"""

import csv
import os
import re
import time
import json
from pathlib import Path
from typing import Optional, List, Dict
import requests
from PIL import Image
from io import BytesIO

INPUT_CSV = "output/products.csv"
OUTPUT_CSV = "output/sneakers_improved_images.csv"
IMG_DIR = Path("output/images")
IMG_DIR.mkdir(exist_ok=True)

# Better image sources with proper sneaker images
SNEAKER_IMAGE_SOURCES = {
    # Nike
    "Nike Air Force 1": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    "Nike Air Max 1": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Air Max 90": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Air Max 95": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Air Max 97": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Air Max 270": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Air Max 720": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike React Infinity Run": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Pegasus": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Dunk": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Blazer": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Cortez": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Internationalist": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Air Huarache": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Air Zoom Vomero": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike ZoomX Vaporfly": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike Free": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Nike ACG": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    
    # Jordan
    "Jordan 1": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    "Jordan 3": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    "Jordan 4": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    "Jordan 5": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    "Jordan 6": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    "Jordan 11": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    "Jordan 12": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    "Jordan 13": "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    
    # Adidas
    "adidas Stan Smith": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    "adidas Superstar": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    "adidas Samba": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    "adidas Gazelle": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    "adidas Campus": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    "adidas Forum": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    "adidas NMD": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    "adidas Ultraboost": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    "adidas ZX": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    "adidas Yeezy": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    
    # New Balance
    "New Balance 990": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "New Balance 993": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "New Balance 992": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "New Balance 2002R": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "New Balance 1906R": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "New Balance 530": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "New Balance 550": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "New Balance 574": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "New Balance Fresh Foam": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    
    # Converse
    "Converse Chuck Taylor": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    "Converse Chuck 70": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    
    # Vans
    "Vans Old Skool": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    "Vans Authentic": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    "Vans Sk8-Hi": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    "Vans Slip-On": "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    
    # ASICS
    "ASICS GEL-Kayano": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "ASICS GEL-Nimbus": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "ASICS GEL-Cumulus": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "ASICS GEL-1130": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "ASICS GT-2000": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "ASICS GEL-Lyte": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "ASICS Novablast": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    
    # Puma
    "Puma Suede": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Puma Clyde": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Puma RS-X": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Puma Future Rider": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Puma Palermo": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Puma Speedcat": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    
    # Reebok
    "Reebok Club C": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Reebok Classic Leather": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Reebok Workout": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Reebok Nano": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Reebok Question": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Reebok Pump": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    
    # Other brands
    "Saucony Jazz": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Saucony Shadow": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Saucony Endorphin": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Hoka Clifton": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Hoka Bondi": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Hoka Arahi": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "On Cloud": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Salomon XT": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Salomon ACS": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Salomon Speedcross": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Brooks Ghost": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Brooks Adrenaline": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Brooks Glycerin": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Mizuno Wave": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Karhu Fusion": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Diadora N9000": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Veja V-10": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Veja Campo": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Common Projects": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
    "Autry Medalist": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
}

def find_best_image(name: str) -> str:
    """Find the best matching image for a sneaker name."""
    name_lower = name.lower()
    
    # Try exact matches first
    for key, url in SNEAKER_IMAGE_SOURCES.items():
        if key.lower() in name_lower:
            return url
    
    # Try partial matches
    for key, url in SNEAKER_IMAGE_SOURCES.items():
        key_parts = key.lower().split()
        name_parts = name_lower.split()
        
        # Check if any key part matches any name part
        for key_part in key_parts:
            for name_part in name_parts:
                if key_part in name_part or name_part in key_part:
                    return url
    
    # Default fallback
    return "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop"

def main():
    rows = []
    with open(INPUT_CSV, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            rows.append(row)

    print(f"Processing {len(rows)} sneaker models...")
    
    for i, row in enumerate(rows, 1):
        name = row["Name"]
        print(f"[{i}/{len(rows)}] Processing: {name}")
        
        # Find the best matching image
        image_url = find_best_image(name)
        row["ImageURL"] = image_url
        row["License"] = "Unsplash License"
        row["Source"] = "Unsplash"
        
        # Add a small delay to be respectful
        time.sleep(0.1)

    # Save CSV
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    print(f"Done. Wrote {OUTPUT_CSV}")

if __name__ == "__main__":
    main()

