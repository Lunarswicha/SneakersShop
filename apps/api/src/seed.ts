import { prisma } from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
	const adminPw = await bcrypt.hash('Admin123!', 10);
	await prisma.user.upsert({
		where: { email: 'admin@example.com' },
		update: { passwordHash: adminPw, role: 'admin' },
		create: { email: 'admin@example.com', passwordHash: adminPw, role: 'admin' }
	});

	// Clean existing catalog to avoid unique conflicts on reseed
	await prisma.orderItem.deleteMany({});
	await prisma.order.deleteMany({});
	await prisma.shoppingCart.deleteMany({});
	await prisma.productImage.deleteMany({});
	await prisma.productVariant.deleteMany({});
	await prisma.product.deleteMany({});

	const brandNames = ['Nike','Adidas','Puma','Diadora','Saucony','Mizuno'];
	const brandMap: Record<string, number> = {};
	for (const name of brandNames) {
		const b = await prisma.brand.upsert({ where: { name }, update: {}, create: { name } });
		brandMap[name] = b.id;
	}
	const category = await prisma.category.upsert({ where: { slug: 'sneakers' }, update: { name: 'Sneakers' }, create: { name: 'Sneakers', slug: 'sneakers' } });

	const catalog: Array<{ model: string; brand: keyof typeof brandMap; query: string }> = [
		{ model: 'Ultraboost 1.0', brand: 'Adidas', query: 'adidas ultraboost sneaker' },
		{ model: 'Stan Smith', brand: 'Adidas', query: 'adidas stan smith sneaker' },
		{ model: 'Samba OG', brand: 'Adidas', query: 'adidas samba sneaker' },
		{ model: 'NMD R1', brand: 'Adidas', query: 'adidas nmd r1 sneaker' },
		{ model: 'Gazelle', brand: 'Adidas', query: 'adidas gazelle sneaker' },
		{ model: 'Air Max 90', brand: 'Nike', query: 'nike air max 90 sneaker' },
		{ model: 'Air Force 1', brand: 'Nike', query: 'nike air force 1 sneaker' },
		{ model: 'Air Jordan 1', brand: 'Nike', query: 'air jordan 1 sneaker' },
		{ model: 'Dunk Low', brand: 'Nike', query: 'nike dunk low sneaker' },
		{ model: 'Pegasus 40', brand: 'Nike', query: 'nike pegasus sneaker' },
		{ model: 'RS-X', brand: 'Puma', query: 'puma rs x sneaker' },
		{ model: 'Suede Classic', brand: 'Puma', query: 'puma suede classic sneaker' },
		{ model: 'Mayze', brand: 'Puma', query: 'puma mayze sneaker' },
		{ model: 'Rider FV', brand: 'Puma', query: 'puma rider sneaker' },
		{ model: 'Blaze of Glory', brand: 'Puma', query: 'puma blaze of glory sneaker' },
		{ model: 'N9000', brand: 'Diadora', query: 'diadora n9000 sneaker' },
		{ model: 'B. Elite', brand: 'Diadora', query: 'diadora b elite sneaker' },
		{ model: 'V7000', brand: 'Diadora', query: 'diadora v7000 sneaker' },
		{ model: 'Endorphin Speed 3', brand: 'Saucony', query: 'saucony endorphin speed sneaker' },
		{ model: 'Triumph 21', brand: 'Saucony', query: 'saucony triumph sneaker' },
		{ model: 'Ride 17', brand: 'Saucony', query: 'saucony ride sneaker' },
		{ model: 'Wave Rider 27', brand: 'Mizuno', query: 'mizuno wave rider sneaker' },
		{ model: 'Wave Inspire 19', brand: 'Mizuno', query: 'mizuno wave inspire sneaker' },
		{ model: 'Wave Sky 7', brand: 'Mizuno', query: 'mizuno wave sky sneaker' }
	];

	const colorways = ['white/black','black/white','red','blue','green'];

	let created = 0;
	// Curated static image URLs per model for consistent visuals
	const imageMap: Record<string, string> = {
		'Ultraboost 1.0': 'https://images.unsplash.com/photo-1584735175315-9d5df2403774?q=80&w=1600&auto=format&fit=crop',
		'Stan Smith': 'https://images.unsplash.com/photo-1603808033192-2b2b9d4d1dfa?q=80&w=1600&auto=format&fit=crop',
		'Samba OG': 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?q=80&w=1600&auto=format&fit=crop',
		'NMD R1': 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1600&auto=format&fit=crop',
		'Gazelle': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1600&auto=format&fit=crop',
		'Air Max 90': 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1600&auto=format&fit=crop',
		'Air Force 1': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop',
		'Air Jordan 1': 'https://images.unsplash.com/photo-1617054141675-6c9f6cfb5e2e?q=80&w=1600&auto=format&fit=crop',
		'Dunk Low': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1600&auto=format&fit=crop',
		'Pegasus 40': 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1600&auto=format&fit=crop',
		'RS-X': 'https://images.unsplash.com/photo-1556909190-eccf4a8bf03d?q=80&w=1600&auto=format&fit=crop',
		'Suede Classic': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop',
		'Mayze': 'https://images.unsplash.com/photo-1620799139504-8b3b2f4b5c3f?q=80&w=1600&auto=format&fit=crop',
		'Rider FV': 'https://images.unsplash.com/photo-1542291022-958fb3ac37d8?q=80&w=1600&auto=format&fit=crop',
		'Blaze of Glory': 'https://images.unsplash.com/photo-1519744346364-73a6b1f0f9a0?q=80&w=1600&auto=format&fit=crop',
		'N9000': 'https://images.unsplash.com/photo-1608231351491-0b6d9a1f4f60?q=80&w=1600&auto=format&fit=crop',
		'B. Elite': 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop',
		'V7000': 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=1600&auto=format&fit=crop',
		'Endorphin Speed 3': 'https://images.unsplash.com/photo-1556909114-16a2c7a27b9a?q=80&w=1600&auto=format&fit=crop',
		'Triumph 21': 'https://images.unsplash.com/photo-1526404428533-3818d5fdfd49?q=80&w=1600&auto=format&fit=crop',
		'Ride 17': 'https://images.unsplash.com/photo-1521417531039-74fbc61f2c3b?q=80&w=1600&auto=format&fit=crop',
		'Wave Rider 27': 'https://images.unsplash.com/photo-1612976023590-099610f4f7c4?q=80&w=1600&auto=format&fit=crop',
		'Wave Inspire 19': 'https://images.unsplash.com/photo-1600180758731-d6a2b9e4f0fb?q=80&w=1600&auto=format&fit=crop',
		'Wave Sky 7': 'https://images.unsplash.com/photo-1542291023-21dca6a9b3a1?q=80&w=1600&auto=format&fit=crop'
	};

	for (let i = 0; i < 100; i++) {
		const entry = catalog[i % catalog.length];
		const basePrice = 99 + (i % 10) * 10;
		const mapped = imageMap[entry.model];
		const imgPrimary = mapped || `https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop`;
		const imgAlt = `https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop`;
		const product = await prisma.product.create({
			data: {
				name: `${entry.brand} ${entry.model}`,
				brandId: brandMap[entry.brand],
				categoryId: category.id,
				description: `${entry.model} by ${entry.brand}. A beloved silhouette built for everyday comfort and performance.`,
				basePrice,
				sku: `SKU-${1000 + i}`,
				images: { create: [
					{ imageUrl: imgPrimary, isPrimary: true, altText: `${entry.model}` },
					{ imageUrl: imgAlt, isPrimary: false, altText: `${entry.brand} detail` }
				] }
			}
		});
		for (let c = 0; c < 5; c++) {
			for (const size of [40,41,42,43,44]) {
				await prisma.productVariant.create({
					data: {
						productId: product.id,
						size,
						color: colorways[c % colorways.length],
						stockQuantity: 25,
						price: basePrice + (c * 5)
					}
				});
			}
		}
		created++;
	}
	console.log(`Seed complete: ${created} products, ~${created * 25} variants`);
}

main().finally(() => prisma.$disconnect());
