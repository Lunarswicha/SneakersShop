# Minimal demo scraping script.
# For legal/ethical scraping, respect robots.txt and the target site's terms of use.
# This script scrapes a static HTML sample and outputs a CSV that the importer can load.

import csv, sys
from bs4 import BeautifulSoup

def parse(html: str):
    soup = BeautifulSoup(html, 'lxml')
    for card in soup.select('.product-card'):
        name_el = card.select_one('.title')
        price_el = card.select_one('.price')
        img_el = card.select_one('img')
        name = name_el.get_text(strip=True) if name_el else 'Sneaker'
        price = (price_el.get_text(strip=True) if price_el else '99').replace('','').strip()
        image = img_el.get('src', '') if img_el else ''
        yield {'name': name, 'brand': 'Unknown', 'category': 'sneakers', 'price': price or '99.00', 'image': image}

def main():
    html_path = sys.argv[1] if len(sys.argv) > 1 else 'sample.html'
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()
    rows = list(parse(html))
    out = 'output/products.csv'
    import os; os.makedirs('output', exist_ok=True)
    with open(out, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=['name','brand','category','price','image'])
        w.writeheader(); w.writerows(rows)
    print(f"Wrote {len(rows)} products to {out}")

if __name__ == '__main__':
    main()
