import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from './lib/prisma.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCsv(csv: string): Array<Record<string,string>> {
	const lines = csv.split(/\r?\n/).filter(Boolean);
	if (lines.length === 0) return [];
	const headers = lines[0].split(',').map(h => h.trim());
	return lines.slice(1).map(line => {
		const cols = line.split(',').map(c => c.trim());
		const row: Record<string,string> = {};
		headers.forEach((h, i) => row[h] = cols[i] || '');
		return row;
	});
}

async function main() {
	const base = path.resolve(__dirname, '../../../tools/scraper/output');
	const stockx = path.join(base, 'stockx_images.csv');
	const commons = path.join(base, 'commons_images.csv');
	const wiki = path.join(base, 'wiki_images.csv');
	let content = '';
	if (existsSync(stockx)) content = readFileSync(stockx, 'utf-8');
	else if (existsSync(commons)) content = readFileSync(commons, 'utf-8');
	else if (existsSync(wiki)) content = readFileSync(wiki, 'utf-8');
	else {
		// Fallback curated map for key models
		const curated: Array<Record<string,string>> = [
			{ brand: 'Adidas', model: 'Ultraboost 1.0', image: 'https://images.unsplash.com/photo-1584735175315-9d5df2403774?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Adidas', model: 'Stan Smith', image: 'https://images.unsplash.com/photo-1603808033192-2b2b9d4d1dfa?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Adidas', model: 'Samba', image: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Adidas', model: 'Gazelle', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Adidas', model: 'NMD R1', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Nike', model: 'Air Max 90', image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Nike', model: 'Air Force 1', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Nike', model: 'Air Jordan 1', image: 'https://images.unsplash.com/photo-1617054141675-6c9f6cfb5e2e?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Nike', model: 'Dunk Low', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Nike', model: 'Pegasus 40', image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Puma', model: 'RS-X', image: 'https://images.unsplash.com/photo-1556909190-eccf4a8bf03d?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Puma', model: 'Suede Classic', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Diadora', model: 'N9000', image: 'https://images.unsplash.com/photo-1608231351491-0b6d9a1f4f60?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Saucony', model: 'Endorphin Speed 3', image: 'https://images.unsplash.com/photo-1556909114-16a2c7a27b9a?q=80&w=1600&auto=format&fit=crop' },
			{ brand: 'Mizuno', model: 'Wave Rider 27', image: 'https://images.unsplash.com/photo-1612976023590-099610f4f7c4?q=80&w=1600&auto=format&fit=crop' }
		];
		for (const row of curated) {
			const nameContains = `${row.brand} ${row.model}`;
			const prod = await prisma.product.findFirst({ where: { name: { contains: nameContains, mode: 'insensitive' } }, include: { images: true } });
			if (!prod) continue;
			if (prod.images.length > 0) {
				await prisma.productImage.update({ where: { id: prod.images[0].id }, data: { imageUrl: row.image, isPrimary: true, altText: `${nameContains}` } });
			} else {
				await prisma.productImage.create({ data: { productId: prod.id, imageUrl: row.image, isPrimary: true, altText: `${nameContains}` } });
			}
			console.log(`Updated image for ${nameContains}`);
		}
		await prisma.$disconnect();
		return;
	}

	const rows = parseCsv(content);
	for (const row of rows) {
		const { brand, model, image } = row;
		if (!brand || !model || !image) continue;
		const nameContains = `${brand} ${model}`;
		const prod = await prisma.product.findFirst({ where: { name: { contains: nameContains, mode: 'insensitive' } }, include: { images: true } });
		if (!prod) continue;
		if (prod.images.length > 0) {
			await prisma.productImage.update({ where: { id: prod.images[0].id }, data: { imageUrl: image, isPrimary: true, altText: `${nameContains}` } });
		} else {
			await prisma.productImage.create({ data: { productId: prod.id, imageUrl: image, isPrimary: true, altText: `${nameContains}` } });
		}
		console.log(`Updated image for ${nameContains}`);
	}
	await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
