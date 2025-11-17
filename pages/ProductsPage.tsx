
import React, { useState, useRef } from 'react';
import { useData } from '../hooks/useData';
import { LOW_STOCK_THRESHOLD } from '../constants';
import { AlertTriangleIcon } from '../components/icons';
import { calculateProfitMargin } from '../utils/priceCalculations';
import { parseImportFile, ImportedProduct } from '../utils/importParser';
import ImportPreviewModal from '../components/ImportPreviewModal';
import CameraScanner from '../components/CameraScanner';

const ProductsPage: React.FC = () => {
    const { products, addProduct, restockProduct, loading } = useData();
    const [name, setName] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [stock, setStock] = useState('');
    const [barcode, setBarcode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [restockingProductId, setRestockingProductId] = useState<string | null>(null);
    const [restockQuantity, setRestockQuantity] = useState('');
    const [restockPurchasePrice, setRestockPurchasePrice] = useState('');
    const [restockSellingPrice, setRestockSellingPrice] = useState('');
    const [restockNotes, setRestockNotes] = useState('');
    const [importedProducts, setImportedProducts] = useState<ImportedProduct[]>([]);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importing, setImporting] = useState(false);
    const [showCameraScanner, setShowCameraScanner] = useState(false);
    const [cameraScanContext, setCameraScanContext] = useState<'add' | 'restock' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePurchasePriceChange = (value: string) => {
        setPurchasePrice(value);
        const pp = parseFloat(value);
        if (!isNaN(pp) && pp > 0) {
            const calculatedSellingPrice = (pp * 1.2).toFixed(2);
            setSellingPrice(calculatedSellingPrice);
        } else {
            setSellingPrice('');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const pp = parseFloat(purchasePrice);
        const sp = parseFloat(sellingPrice);
        const st = parseInt(stock, 10);

        if (!name || isNaN(pp) || isNaN(sp) || isNaN(st)) {
            setError('All fields are required and must be valid numbers.');
            return;
        }
        if (pp <= 0 || sp <= 0 || st < 0) {
            setError('Prices must be positive, and stock cannot be negative.');
            return;
        }
        if (sp < pp) {
            setError('Selling price should not be less than purchase price.');
            return;
        }

        try {
            await addProduct({
                name,
                purchasePrice: pp,
                sellingPrice: sp,
                stock: st,
                barcode: barcode.trim() || undefined
            });
            setSuccess(`Product "${name}" added successfully!`);
            setName('');
            setPurchasePrice('');
            setSellingPrice('');
            setStock('');
            setBarcode('');
        } catch (err) {
            setError('Failed to add product. Please try again.');
        }
    };

    const startRestock = (productId: string, currentPrice: number, currentSellingPrice: number) => {
        setRestockingProductId(productId);
        setRestockPurchasePrice(currentPrice.toString());
        setRestockSellingPrice(currentSellingPrice.toString());
        setRestockQuantity('');
        setRestockNotes('');
        setError('');
        setSuccess('');
    };

    const handleRestock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restockingProductId) return;

        setError('');
        setSuccess('');

        const qty = parseInt(restockQuantity, 10);
        const pp = parseFloat(restockPurchasePrice);
        const sp = parseFloat(restockSellingPrice);

        if (isNaN(qty) || isNaN(pp) || isNaN(sp)) {
            setError('All fields are required and must be valid numbers.');
            return;
        }
        if (qty <= 0 || pp <= 0 || sp <= 0) {
            setError('Quantity and prices must be positive.');
            return;
        }
        if (sp < pp) {
            setError('Selling price should not be less than purchase price.');
            return;
        }

        try {
            await restockProduct(restockingProductId, qty, pp, sp, restockNotes || undefined);
            const product = products.find(p => p.id === restockingProductId);
            setSuccess(`Successfully restocked "${product?.name}"!`);
            setRestockingProductId(null);
            setRestockQuantity('');
            setRestockPurchasePrice('');
            setRestockSellingPrice('');
            setRestockNotes('');
        } catch (err) {
            setError('Failed to restock product. Please try again.');
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setSuccess('');
        setImporting(true);

        try {
            const result = await parseImportFile(file);

            if (!result.success) {
                setError(result.errors.join('; '));
                setImporting(false);
                return;
            }

            if (result.products.length === 0) {
                setError('No valid products found in the file');
                setImporting(false);
                return;
            }

            setImportedProducts(result.products);
            setShowImportModal(true);
        } catch (err) {
            setError('Failed to read file. Please try again.');
        } finally {
            setImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleImportConfirm = async (productsToImport: ImportedProduct[]) => {
        setShowImportModal(false);
        setError('');
        setSuccess('');
        setImporting(true);

        let successCount = 0;
        let errorCount = 0;

        try {
            for (const product of productsToImport) {
                try {
                    if (product.status === 'update' && product.existingProductId) {
                        await restockProduct(
                            product.existingProductId,
                            product.stock,
                            product.purchasePrice,
                            product.sellingPrice,
                            'Imported via file upload'
                        );
                    } else {
                        await addProduct({
                            name: product.name,
                            purchasePrice: product.purchasePrice,
                            sellingPrice: product.sellingPrice,
                            stock: product.stock,
                            barcode: product.barcode
                        });
                    }
                    successCount++;
                } catch (err) {
                    errorCount++;
                    console.error(`Failed to import product: ${product.name}`, err);
                }
            }

            if (successCount > 0) {
                setSuccess(`Successfully imported ${successCount} product(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
            }
            if (errorCount > 0 && successCount === 0) {
                setError(`Failed to import ${errorCount} product(s)`);
            }
        } finally {
            setImporting(false);
            setImportedProducts([]);
        }
    };

    const handleImportCancel = () => {
        setShowImportModal(false);
        setImportedProducts([]);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleCameraScan = (scannedBarcode: string) => {
        setShowCameraScanner(false);
        if (cameraScanContext === 'add') {
            setBarcode(scannedBarcode);
            setSuccess(`Barcode scanned: ${scannedBarcode}`);
            setTimeout(() => setSuccess(''), 2000);
        } else if (cameraScanContext === 'restock') {
            const product = products.find(p => p.barcode === scannedBarcode);
            if (product) {
                startRestock(product.id, product.purchasePrice, product.sellingPrice);
                setSuccess(`Product found: ${product.name}`);
                setTimeout(() => setSuccess(''), 2000);
            } else {
                setError(`No product found with barcode: ${scannedBarcode}`);
            }
        }
        setCameraScanContext(null);
    };

    const openCameraScanner = (context: 'add' | 'restock') => {
        setCameraScanContext(context);
        setShowCameraScanner(true);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Add Product</h2>
                <p className="text-slate-600 mb-4">Add a new item to your inventory.</p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Bulk Import</h3>
                    <p className="text-sm text-blue-800 mb-3">
                        Import multiple products from Excel or CSV file
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        onClick={triggerFileInput}
                        disabled={importing}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                    >
                        {importing ? 'Processing...' : 'Choose File to Import'}
                    </button>
                    <p className="text-xs text-blue-700 mt-2">
                        Supported formats: CSV, Excel (.xlsx, .xls)
                    </p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 sticky top-24">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g., Coffee Beans"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="purchasePrice" className="block text-sm font-medium text-slate-700 mb-1">Purchase Price ($)</label>
                                <input type="number" id="purchasePrice" value={purchasePrice} onChange={e => handlePurchasePriceChange(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="10.00" step="0.01"/>
                            </div>
                            <div>
                                <label htmlFor="sellingPrice" className="block text-sm font-medium text-slate-700 mb-1">Selling Price ($) <span className="text-xs text-slate-500">(20% markup)</span></label>
                                <input type="number" id="sellingPrice" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="12.00" step="0.01"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-1">Initial Stock Quantity</label>
                            <input type="number" id="stock" value={stock} onChange={e => setStock(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="50" step="1"/>
                        </div>
                        <div>
                            <label htmlFor="barcode" className="block text-sm font-medium text-slate-700 mb-1">Barcode <span className="text-xs text-slate-500">(optional)</span></label>
                            <div className="flex gap-2">
                                <input type="text" id="barcode" value={barcode} onChange={e => setBarcode(e.target.value)} className="block flex-1 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g., 123456789012"/>
                                <button
                                    type="button"
                                    onClick={() => openCameraScanner('add')}
                                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                    title="Scan with camera"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {success && <p className="text-sm text-green-600">{success}</p>}
                        <div>
                            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add Product to Inventory</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="lg:col-span-2">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Current Inventory</h2>
                        <p className="text-slate-600">A list of all products in your shop.</p>
                    </div>
                    <button
                        onClick={() => openCameraScanner('restock')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Scan to Restock
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    {loading ? <p className="p-4 text-slate-500">Loading products...</p> : (
                        <ul className="divide-y divide-slate-200">
                           {products.length === 0 && <li className="p-4 text-center text-slate-500">No products found. Add one to get started!</li>}
                            {products.map(p => {
                                const isLowStock = p.stock < LOW_STOCK_THRESHOLD;
                                const profit = p.sellingPrice - p.purchasePrice;

                                const marginPercent = calculateProfitMargin(p.sellingPrice, p.weightedAvgCost || p.purchasePrice);
                                const isRestocking = restockingProductId === p.id;

                                return (
                                <li key={p.id} className={`p-4 ${isLowStock ? 'bg-orange-50' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800">{p.name}</p>
                                            <p className="text-sm text-slate-500">
                                                <span>Price: <span className="font-medium text-slate-700">{formatCurrency(p.sellingPrice)}</span></span> &bull;
                                                <span> Cost: <span className="font-medium text-slate-700">{formatCurrency(p.purchasePrice)}</span></span> &bull;
                                                <span> Profit: <span className="font-medium text-green-600">{formatCurrency(profit)}</span></span>
                                            </p>
                                            {p.weightedAvgCost && p.weightedAvgCost !== p.purchasePrice && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Avg Cost: {formatCurrency(p.weightedAvgCost)} &bull; Margin: {marginPercent.toFixed(1)}%
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className={`font-bold text-lg ${isLowStock ? 'text-orange-600' : 'text-slate-800'}`}>{p.stock}</p>
                                            <p className="text-sm text-slate-500">in stock</p>
                                            <button
                                                onClick={() => startRestock(p.id, p.purchasePrice, p.sellingPrice)}
                                                className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                + Restock
                                            </button>
                                        </div>
                                    </div>
                                    {isLowStock && (
                                        <div className="mt-2 text-xs text-orange-700 flex items-center gap-1">
                                            <AlertTriangleIcon className="h-4 w-4" />
                                            <span>Low stock, restock needed.</span>
                                        </div>
                                    )}
                                </li>
                            )})}
                        </ul>
                    )}
                </div>
                {restockingProductId && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-slate-900">
                                Restock: {products.find(p => p.id === restockingProductId)?.name}
                            </h3>
                            <button
                                onClick={() => setRestockingProductId(null)}
                                className="text-slate-500 hover:text-slate-700"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleRestock} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        value={restockQuantity}
                                        onChange={e => setRestockQuantity(e.target.value)}
                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="50"
                                        step="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price ($)</label>
                                    <input
                                        type="number"
                                        value={restockPurchasePrice}
                                        onChange={e => setRestockPurchasePrice(e.target.value)}
                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="10.00"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price ($)</label>
                                    <input
                                        type="number"
                                        value={restockSellingPrice}
                                        onChange={e => setRestockSellingPrice(e.target.value)}
                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="12.00"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                                <input
                                    type="text"
                                    value={restockNotes}
                                    onChange={e => setRestockNotes(e.target.value)}
                                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    placeholder="e.g., New supplier, price increase"
                                />
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            {success && <p className="text-sm text-green-600">{success}</p>}
                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                            >
                                Add Stock
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <ImportPreviewModal
                isOpen={showImportModal}
                importedProducts={importedProducts}
                existingProducts={products}
                onClose={handleImportCancel}
                onConfirm={handleImportConfirm}
            />

            {showCameraScanner && (
                <CameraScanner
                    onScanSuccess={handleCameraScan}
                    onClose={() => {
                        setShowCameraScanner(false);
                        setCameraScanContext(null);
                    }}
                />
            )}
        </div>
    );
};

export default ProductsPage;
