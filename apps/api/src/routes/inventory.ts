import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Schema de validation pour la mise à jour du stock
const updateStockSchema = z.object({
  variantId: z.number().int().positive(),
  stockQuantity: z.number().int().min(0),
});

// Obtenir tous les produits avec leurs variantes et stocks
router.get('/products', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Vérifier que l'utilisateur est admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const products = await prisma.product.findMany({
      include: {
        brand: true,
        variants: {
          select: {
            id: true,
            size: true,
            color: true,
            stockQuantity: true,
            price: true,
            sku: true,
            createdAt: true,
          },
        },
        images: {
          where: { isPrimary: true },
          select: {
            imageUrl: true,
            altText: true,
          },
        },
        _count: {
          select: {
            variants: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Calculer les statistiques de stock
    const stockStats = {
      totalProducts: products.length,
      totalVariants: products.reduce((sum, product) => sum + product._count.variants, 0),
      totalStock: products.reduce((sum, product) => 
        sum + product.variants.reduce((variantSum, variant) => variantSum + variant.stockQuantity, 0), 0),
      lowStockProducts: products.filter(product => 
        product.variants.some(variant => variant.stockQuantity < 10)
      ).length,
      outOfStockProducts: products.filter(product => 
        product.variants.every(variant => variant.stockQuantity === 0)
      ).length,
    };

    res.json({
      products,
      stats: stockStats,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory data' });
  }
});

// Mettre à jour le stock d'une variante
router.put('/stock', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Vérifier que l'utilisateur est admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { variantId, stockQuantity } = updateStockSchema.parse(req.body);

    // Vérifier que la variante existe
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            brand: true,
          },
        },
      },
    });

    if (!variant) {
      return res.status(404).json({ error: 'Product variant not found' });
    }

    // Mettre à jour le stock
    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stockQuantity },
      include: {
        product: {
          include: {
            brand: true,
          },
        },
      },
    });

    res.json({
      message: 'Stock updated successfully',
      variant: updatedVariant,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Obtenir les statistiques de stock
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Vérifier que l'utilisateur est admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const [
      totalProducts,
      totalVariants,
      totalStock,
      lowStockVariants,
      outOfStockVariants,
      recentUpdates,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.productVariant.count(),
      prisma.productVariant.aggregate({
        _sum: { stockQuantity: true },
      }),
      prisma.productVariant.count({
        where: { stockQuantity: { lt: 10, gt: 0 } },
      }),
      prisma.productVariant.count({
        where: { stockQuantity: 0 },
      }),
      prisma.productVariant.findMany({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 derniers jours
          },
        },
        include: {
          product: {
            include: {
              brand: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
    ]);

    const stats = {
      totalProducts,
      totalVariants,
      totalStock: totalStock._sum.stockQuantity || 0,
      lowStockVariants,
      outOfStockVariants,
      recentUpdates,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stock stats:', error);
    res.status(500).json({ error: 'Failed to fetch stock statistics' });
  }
});

// Rechercher des produits par nom, marque ou SKU
router.get('/search', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { q, brand, lowStock, outOfStock } = req.query;
    
    let whereClause: any = {};
    
    if (q) {
      whereClause.OR = [
        { name: { contains: q as string, mode: 'insensitive' } },
        { sku: { contains: q as string, mode: 'insensitive' } },
        { brand: { name: { contains: q as string, mode: 'insensitive' } } },
      ];
    }
    
    if (brand) {
      whereClause.brand = { name: { contains: brand as string, mode: 'insensitive' } };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        brand: true,
        variants: {
          select: {
            id: true,
            size: true,
            color: true,
            stockQuantity: true,
            price: true,
            sku: true,
          },
        },
        images: {
          where: { isPrimary: true },
          select: {
            imageUrl: true,
            altText: true,
          },
        },
      },
    });

    // Filtrer par stock si demandé
    let filteredProducts = products;
    if (lowStock === 'true') {
      filteredProducts = products.filter(product => 
        product.variants.some(variant => variant.stockQuantity < 10 && variant.stockQuantity > 0)
      );
    }
    if (outOfStock === 'true') {
      filteredProducts = products.filter(product => 
        product.variants.every(variant => variant.stockQuantity === 0)
      );
    }

    res.json(filteredProducts);
  } catch (error) {
    console.error('Error searching inventory:', error);
    res.status(500).json({ error: 'Failed to search inventory' });
  }
});

export default router;
