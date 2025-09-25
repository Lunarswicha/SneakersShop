'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotification } from '../../../../contexts/NotificationContext';
import { API_BASE } from '../../../../lib/api';

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
  description: string | null;
  basePrice: number | null;
  sku: string | null;
}

export default function ProductInventoryPage() {
  const { user, loading } = useAuth();
  const { showNotification } = useNotification();
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [editingStock, setEditingStock] = useState<number | null>(null);
  const [newStockValue, setNewStockValue] = useState('');

  useEffect(() => {
    if (user && user.role === 'admin' && productId) {
      fetchProductData();
    }
  }, [user, productId]);

  const fetchProductData = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(`${API_BASE}/inventory/products`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        const foundProduct = data.products.find((p: Product) => p.id === parseInt(productId));
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          showNotification('Produit non trouv√', 'error');
          router.push('/admin/inventory');
        }
      } else {
        showNotification('Erreur lors du chargement du produit', 'error');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
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
        fetchProductData(); // Rafra√chir les donn√es
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

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Rupture', color: 'text-red-600 bg-red-100' };
    if (stock < 10) return { text: 'Stock faible', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'En stock', color: 'text-green-600 bg-green-100' };
  };

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

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouv√</h1>
          <button
            onClick={() => router.push('/admin/inventory')}
            className="btn-primary"
          >
            Retour √ l'inventaire
          </button>
        </div>
      </div>
    );
  }

  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/inventory')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
             Retour √ l'inventaire
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-2 text-gray-600">
            {product.brand?.name}  Stock total: {totalStock} unit√s
          </p>
        </div>

        {/* Informations du produit */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {product.images[0] && (
                <img
                  className="w-full h-64 object-cover rounded-lg"
                  src={product.images[0].imageUrl}
                  alt={product.images[0].altText || product.name}
                />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du produit</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Nom:</span>
                  <span className="ml-2 text-gray-900">{product.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Marque:</span>
                  <span className="ml-2 text-gray-900">{product.brand?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">SKU:</span>
                  <span className="ml-2 text-gray-900">{product.sku || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Prix de base:</span>
                  <span className="ml-2 text-gray-900">
                    {product.basePrice ? `${product.basePrice}` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="mt-1 text-gray-900">{product.description || 'Aucune description'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gestion des variantes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Gestion des stocks par variante</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Couleur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {product.variants.map((variant) => {
                  const stockStatus = getStockStatus(variant.stockQuantity);
                  
                  return (
                    <tr key={variant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.size || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.color || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.sku || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.price ? `${variant.price}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStock === variant.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={newStockValue}
                              onChange={(e) => setNewStockValue(e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                            />
                            <button
                              onClick={handleStockSave}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              
                            </button>
                            <button
                              onClick={handleStockCancel}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            {variant.stockQuantity}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingStock !== variant.id && (
                          <button
                            onClick={() => handleStockEdit(variant.id, variant.stockQuantity)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Modifier
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {product.variants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">Aucune variante trouv√e pour ce produit</div>
          </div>
        )}
      </div>
    </div>
  );
}
