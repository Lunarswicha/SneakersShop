import csv, os, requests, time

MODELS = [
	('Adidas', 'Ultraboost 1.0'),
	('Adidas', 'Stan Smith'),
	('Adidas', 'Samba'),
	('Adidas', 'Gazelle'),
	('Adidas', 'NMD R1'),
	('Nike', 'Air Max 90'),
	('Nike', 'Air Force 1'),
	('Nike', 'Air Jordan 1'),
	('Nike', 'Dunk Low'),
	('Nike', 'Pegasus 40'),
	('Puma', 'RS-X'),
	('Puma', 'Suede Classic'),
	('Diadora', 'N9000'),
	('Saucony', 'Endorphin Speed 3'),
	('Mizuno', 'Wave Rider 27')
]

BROWSE = 'https://stockx.com/api/browse?_search={query}'
HEADERS = {
	'accept': 'application/json',
	'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
	'accept-language': 'en-US,en;q=0.9',
	'origin': 'https://stockx.com',
	'referer': 'https://stockx.com/'
}


def search_image(brand, model):
	query = f"{brand} {model}"
	url = BROWSE.format(query=requests.utils.quote(query))
	r = requests.get(url, headers=HEADERS, timeout=15)
	if r.status_code != 200:
		return None
	j = r.json()
	products = (j.get('Products') or [])
	for p in products:
		media = p.get('media') or {}
		img = media.get('imageUrl') or media.get('smallImageUrl') or media.get('thumbUrl')
		if img:
			return img
	return None


def main():
	out_dir = os.path.join(os.path.dirname(__file__), 'output')
	os.makedirs(out_dir, exist_ok=True)
	out = os.path.join(out_dir, 'stockx_images.csv')
	rows = []
	for brand, model in MODELS:
		img = None
		try:
			img = search_image(brand, model)
		except Exception:
			img = None
		rows.append({'brand': brand, 'model': model, 'image': img or ''})
		print(f"{brand} {model}: {img or 'NO IMAGE'}")
		time.sleep(0.8)
	with open(out, 'w', newline='', encoding='utf-8') as f:
		w = csv.DictWriter(f, fieldnames=['brand','model','image'])
		w.writeheader(); w.writerows(rows)
	print(f"Wrote {len(rows)} rows to {out}")

if __name__ == '__main__':
	main()






