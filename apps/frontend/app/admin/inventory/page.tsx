'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { API_BASE } from '../../../lib/api';

interface ProductVariant {
  id: number;
  size: number | null;
  color: string | null;
  stockQuantity: number;
  price: number | null;
  sku: string | null;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  brand: {
    id: number;
    name: string;
  } | null;
  variants: ProductVariant[];
  images: {
    imageUrl: string;
    altText: string | null;
  }[];
  _count: {
    variants: number;
  };
}

interface InventoryStats {
  totalProducts: number;
  totalVariants: number;
  totalStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export default function InventoryPage() {
  const { user, loading } = useAuth();
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [newStockValue, setNewStockValue] = useState('');

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchInventoryData();
    }
  }, [user]);

  const fetchInventoryData = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(`${API_BASE}/inventory/products`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setStats(data.stats);
      } else {
        showNotification('Erreur lors du chargement des donn√es', 'error');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      showNotification('Erreur de connexion', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const updateStock = async (variantId: number, newStock: number) => {
    try {
      const response = await fetch(`${API_BASE}/inventory/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          variantId,
          stockQuantity: newStock,
        }),
      });

      if (response.ok) {
        showNotification('Stock mis √ jour avec succ√s', 'success');
        fetchInventoryData(); // Rafra√chir les donn√es
        setEditingStock(null);
        setNewStockValue('');
      } else {
        showNotification('Erreur lors de la mise √ jour du stock', 'error');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      showNotification('Erreur de connexion', 'error');
    }
  };

  const handleStockEdit = (variantId: number, currentStock: number) => {
    setEditingStock(variantId);
    setNewStockValue(currentStock.toString());
  };

  const handleStockSave = () => {
    if (editingStock && newStockValue !== '') {
      const newStock = parseInt(newStockValue);
      if (!isNaN(newStock) && newStock >= 0) {
        updateStock(editingStock, newStock);
      } else {
        showNotification('Valeur de stock invalide', 'error');
      }
    }
  };

  const handleStockCancel = () => {
    setEditingStock(null);
    setNewStockValue('');
  };

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = !filterBrand || product.brand?.name.toLowerCase().includes(filterBrand.toLowerCase());
    
    let matchesStock = true;
    if (filterStock === 'low') {
      matchesStock = product.variants.some(v => v.stockQuantity < 10 && v.stockQuantity > 0);
    } else if (filterStock === 'out') {
      matchesStock = product.variants.every(v => v.stockQuantity === 0);
    } else if (filterStock === 'in') {
      matchesStock = product.variants.some(v => v.stockQuantity >= 10);
    }
    
    return matchesSearch && matchesBrand && matchesStock;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acc√s refus√</h1>
          <p className="text-gray-600">Vous devez √tre administrateur pour acc√der √ cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Stocks</h1>
          <p className="mt-2 text-gray-600">G√rez l'inventaire de vos produits</p>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
              <div className="text-sm text-gray-600">Produits</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.totalVariants}</div>
              <div className="text-sm text-gray-600">Variantes</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{stats.totalStock}</div>
              <div className="text-sm text-gray-600">Stock Total</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</div>
              <div className="text-sm text-gray-600">Stock Faible</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</div>
              <div className="text-sm text-gray-600">Rupture</div>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom du produit ou marque..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marque</label>
              <input
                type="text"
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                placeholder="Filtrer par marque..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">√tat du Stock</label>
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="in">En Stock</option>
                <option value="low">Stock Faible</option>
                <option value="out">Rupture</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des produits */}
        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const totalStock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
                    const hasLowStock = product.variants.some(v => v.stockQuantity < 10 && v.stockQuantity > 0);
                    const isOutOfStock = product.variants.every(v => v.stockQuantity === 0);
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {product.images[0] && (
                              <img
                                className="h-12 w-12 rounded-lg object-cover mr-4"
                                src={product.images[0].imageUrl}
                                alt={product.images[0].altText || product.name}
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">ID: {product.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.brand?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product._count.variants}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            isOutOfStock ? 'text-red-600' : 
                            hasLowStock ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {totalStock}
                            {isOutOfStock && ' (Rupture)'}
                            {hasLowStock && !isOutOfStock && ' (Faible)'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              // Afficher les d√tails des variantes
                              const variants = product.variants.map(v => 
                                `Taille: ${v.size || 'N/A'}, Couleur: ${v.color || 'N/A'}, Stock: ${v.stockQuantity}`
                              ).join('\n');
                              alert(`Variantes:\n${variants}`);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Voir d√tails
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && !loadingData && (
          <div className="text-center py-12">
            <div className="text-gray-500">Aucun produit trouv√</div>
          </div>
        )}
      </div>
    </div>
  );
}
