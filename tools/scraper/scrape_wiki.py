import csv, os
import requests
from bs4 import BeautifulSoup

MODELS = [
	('Adidas', 'Ultraboost'),
	('Adidas', 'Stan Smith'),
	('Adidas', 'Samba'),
	('Adidas', 'Gazelle'),
	('Nike', 'Air Max 90'),
	('Nike', 'Air Force 1'),
	('Nike', 'Air Jordan 1'),
	('Nike', 'Dunk Low'),
	('Puma', 'Suede'),
	('Puma', 'RS-X'),
	('Diadora', 'N9000'),
	('Saucony', 'Endorphin Speed'),
	('Mizuno', 'Wave Rider')
]

WIKI_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/{title}"


def get_thumbnail(title_candidates):
	for title in title_candidates:
		url = WIKI_SUMMARY.format(title=requests.utils.quote(title))
		resp = requests.get(url, headers={"accept":"application/json"})
		if resp.status_code != 200:
			continue
		data = resp.json()
		thumb = data.get('thumbnail', {}).get('source')
		if thumb:
			return thumb
	return None


def main():
	out_dir = os.path.join(os.path.dirname(__file__), 'output')
	os.makedirs(out_dir, exist_ok=True)
	out = os.path.join(out_dir, 'wiki_images.csv')
	rows = []
	for brand, model in MODELS:
		candidates = [f"{brand} {model}", model]
		img = get_thumbnail(candidates)
		rows.append({'brand': brand, 'model': model, 'image': img or ''})
		print(f"{brand} {model}: {img or 'NO IMAGE'}")
	with open(out, 'w', newline='', encoding='utf-8') as f:
		w = csv.DictWriter(f, fieldnames=['brand','model','image'])
		w.writeheader(); w.writerows(rows)
	print(f"Wrote {len(rows)} rows to {out}")


if __name__ == '__main__':
	main()
