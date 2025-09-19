import csv, os, requests, urllib.parse

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

API = 'https://commons.wikimedia.org/w/api.php'


def search_image(query):
	params = {
		'action': 'query',
		'format': 'json',
		'generator': 'search',
		'gsrsearch': query + ' filetype:bitmap',
		'gsrlimit': '5',
		'prop': 'imageinfo',
		'iiprop': 'url',
	}
	r = requests.get(API, params=params, headers={'accept':'application/json'})
	if r.status_code != 200:
		return None
	data = r.json().get('query', {}).get('pages', {})
	for _, page in data.items():
		iinfo = page.get('imageinfo')
		if not iinfo:
			continue
		url = iinfo[0].get('url')
		if url and (url.lower().endswith('.jpg') or url.lower().endswith('.jpeg') or url.lower().endswith('.png')):
			return url
	return None


def main():
	out_dir = os.path.join(os.path.dirname(__file__), 'output')
	os.makedirs(out_dir, exist_ok=True)
	out = os.path.join(out_dir, 'commons_images.csv')
	rows = []
	for brand, model in MODELS:
		q = f"{brand} {model} sneaker"
		img = search_image(q)
		rows.append({'brand': brand, 'model': model, 'image': img or ''})
		print(f"{brand} {model}: {img or 'NO IMAGE'}")
	with open(out, 'w', newline='', encoding='utf-8') as f:
		w = csv.DictWriter(f, fieldnames=['brand','model','image'])
		w.writeheader(); w.writerows(rows)
	print(f"Wrote {len(rows)} rows to {out}")

if __name__ == '__main__':
	main()
