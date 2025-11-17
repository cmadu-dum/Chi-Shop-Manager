import React, { useState, useEffect } from 'react';
import { ImportedProduct } from '../utils/importParser';
import { Product } from '../types';
import { CheckCircleIcon, AlertTriangleIcon } from './icons';

interface ImportPreviewModalProps {
  isOpen: boolean;
  importedProducts: ImportedProduct[];
  existingProducts: Product[];
  onClose: () => void;
  onConfirm: (products: ImportedProduct[]) => void;
}

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  isOpen,
  importedProducts,
  existingProducts,
  onClose,
  onConfirm
}) => {
  const [products, setProducts] = useState<ImportedProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

  useEffect(() => {
    const processedProducts = importedProducts.map(product => {
      const existing = existingProducts.find(
        p => p.name.toLowerCase() === product.name.toLowerCase()
      );

      if (existing && product.status !== 'error') {
        return {
          ...product,
          status: 'update' as const,
          existingProductId: existing.id
        };
      }

      return product;
    });

    setProducts(processedProducts);

    const validIndices = new Set(
      processedProducts
        .map((p, i) => (p.status !== 'error' ? i : -1))
        .filter(i => i !== -1)
    );
    setSelectedProducts(validIndices);
  }, [importedProducts, existingProducts]);

  const toggleSelection = (index: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedProducts.size === products.filter(p => p.status !== 'error').length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(
        new Set(products.map((p, i) => (p.status !== 'error' ? i : -1)).filter(i => i !== -1))
      );
    }
  };

  const handleEditProduct = (index: number, field: keyof ImportedProduct, value: any) => {
    setProducts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleConfirm = () => {
    const selectedProductsList = products.filter((_, i) => selectedProducts.has(i));
    onConfirm(selectedProductsList);
  };

  const stats = {
    total: products.length,
    new: products.filter(p => p.status === 'new').length,
    update: products.filter(p => p.status === 'update').length,
    error: products.filter(p => p.status === 'error').length,
    selected: selectedProducts.size
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Import</h2>
          <p className="text-gray-600">Review and edit the products before importing</p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-blue-600 font-medium">Total</div>
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="text-xs text-green-600 font-medium">New</div>
              <div className="text-2xl font-bold text-green-700">{stats.new}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="text-xs text-yellow-600 font-medium">Update</div>
              <div className="text-2xl font-bold text-yellow-700">{stats.update}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <div className="text-xs text-red-600 font-medium">Errors</div>
              <div className="text-2xl font-bold text-red-700">{stats.error}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="text-xs text-purple-600 font-medium">Selected</div>
              <div className="text-2xl font-bold text-purple-700">{stats.selected}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProducts.size === products.filter(p => p.status !== 'error').length && products.filter(p => p.status !== 'error').length > 0}
                onChange={toggleAll}
                className="w-4 h-4 text-blue-600 rounded"
              />
              Select All Valid Products
            </label>
          </div>

          <div className="space-y-3">
            {products.map((product, index) => (
              <div
                key={index}
                className={`border-2 rounded-lg p-4 ${
                  product.status === 'error'
                    ? 'bg-red-50 border-red-300'
                    : product.status === 'update'
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-green-50 border-green-300'
                } ${selectedProducts.has(index) ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {product.status !== 'error' && (
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(index)}
                      onChange={() => toggleSelection(index)}
                      className="w-5 h-5 text-blue-600 rounded mt-1"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {product.status === 'new' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                          <CheckCircleIcon className="w-3 h-3" />
                          NEW
                        </span>
                      )}
                      {product.status === 'update' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white text-xs font-semibold rounded">
                          <AlertTriangleIcon className="w-3 h-3" />
                          UPDATE EXISTING
                        </span>
                      )}
                      {product.status === 'error' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                          <AlertTriangleIcon className="w-3 h-3" />
                          ERROR
                        </span>
                      )}
                    </div>

                    {product.status === 'error' ? (
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{product.name}</div>
                        <div className="text-sm text-red-600">{product.errorMessage}</div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Product Name
                            </label>
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => handleEditProduct(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Barcode (Optional)
                            </label>
                            <input
                              type="text"
                              value={product.barcode || ''}
                              onChange={(e) => handleEditProduct(index, 'barcode', e.target.value || undefined)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., 123456789012"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Purchase Price (₦)
                            </label>
                            <input
                              type="number"
                              value={product.purchasePrice}
                              onChange={(e) => handleEditProduct(index, 'purchasePrice', Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Selling Price (₦)
                            </label>
                            <input
                              type="number"
                              value={product.sellingPrice}
                              onChange={(e) => handleEditProduct(index, 'sellingPrice', Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Stock Quantity
                            </label>
                            <input
                              type="number"
                              value={product.stock}
                              onChange={(e) => handleEditProduct(index, 'stock', Number(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                              step="1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between items-center gap-4 bg-gray-50">
          <div className="text-sm text-gray-600">
            {stats.selected} product(s) selected for import
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={stats.selected === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Import {stats.selected} Product(s)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPreviewModal;
