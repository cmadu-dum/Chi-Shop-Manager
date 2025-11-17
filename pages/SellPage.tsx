
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import BarcodeScanner from '../components/BarcodeScanner';
import CameraScanner from '../components/CameraScanner';
import { Product } from '../types';

const SellPage: React.FC = () => {
    const { products, sellProduct } = useData();
    const navigate = useNavigate();

    const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.id || '');
    const [quantity, setQuantity] = useState('1');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [manualBarcode, setManualBarcode] = useState('');
    const [scanMode, setScanMode] = useState<'dropdown' | 'scan'>('dropdown');
    const [showCameraScanner, setShowCameraScanner] = useState(false);
    const barcodeInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedProduct) {
            setError('Please select a product.');
            return;
        }

        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            setError('Please enter a valid, positive quantity.');
            return;
        }

        try {
            await sellProduct(selectedProduct, qty);
            const productName = products.find(p => p.id === selectedProduct)?.name;
            setSuccess(`Successfully sold ${qty} x ${productName}!`);
            // Reset form after a short delay to show success message
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to process sale.');
        }
    };

    const handleProductScanned = (product: Product) => {
        setSelectedProduct(product.id);
        setError('');
        setSuccess('');
        setManualBarcode('');
    };

    const handleScanError = (errorMsg: string) => {
        setError(errorMsg);
        setTimeout(() => setError(''), 3000);
    };

    const handleManualBarcodeSearch = () => {
        if (!manualBarcode.trim()) {
            setError('Please enter a barcode');
            return;
        }

        const product = products.find(p => p.barcode === manualBarcode.trim());

        if (product) {
            if (product.stock <= 0) {
                setError(`Product "${product.name}" is out of stock`);
            } else {
                setSelectedProduct(product.id);
                setError('');
                setSuccess(`Product found: ${product.name}`);
                setTimeout(() => setSuccess(''), 2000);
            }
        } else {
            setError(`No product found with barcode: ${manualBarcode}`);
        }

        setManualBarcode('');
    };

    const toggleScanMode = (mode: 'dropdown' | 'scan') => {
        setScanMode(mode);
        setError('');
        setSuccess('');
        setManualBarcode('');
    };

    const handleCameraScan = (barcode: string) => {
        setShowCameraScanner(false);
        const product = products.find(p => p.barcode === barcode);

        if (product) {
            if (product.stock <= 0) {
                setError(`Product "${product.name}" is out of stock`);
            } else {
                setSelectedProduct(product.id);
                setSuccess(`Product found: ${product.name}`);
                setTimeout(() => setSuccess(''), 2000);
            }
        } else {
            setError(`No product found with barcode: ${barcode}`);
        }
    };

    const product = products.find(p => p.id === selectedProduct);

    return (
        <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Record a Sale</h2>
            <p className="text-slate-600 mb-8">Sell an item from your inventory.</p>
        
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
                {products.length > 0 ? (
                    <>
                        <div className="mb-6 flex gap-2">
                            <button
                                type="button"
                                onClick={() => toggleScanMode('dropdown')}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                    scanMode === 'dropdown'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Select Product
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleScanMode('scan')}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                    scanMode === 'scan'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Scan Barcode
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {scanMode === 'dropdown' ? (
                                <div>
                                    <label htmlFor="product" className="block text-sm font-medium text-slate-700 mb-1">
                                        Product
                                    </label>
                                    <select
                                        id="product"
                                        value={selectedProduct}
                                        onChange={(e) => {
                                            setSelectedProduct(e.target.value);
                                            setError('');
                                            setSuccess('');
                                        }}
                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    >
                                        {products.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.stock} in stock)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="barcode" className="block text-sm font-medium text-slate-700 mb-1">
                                        Enter or Scan Barcode
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            ref={barcodeInputRef}
                                            type="text"
                                            id="barcode"
                                            value={manualBarcode}
                                            onChange={(e) => setManualBarcode(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleManualBarcodeSearch();
                                                }
                                            }}
                                            className="block flex-1 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            placeholder="Scan or type barcode"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleManualBarcodeSearch}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Search
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowCameraScanner(true)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                                            title="Scan with camera"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Use a barcode scanner, type manually, or scan with camera
                                    </p>
                                    {product && (
                                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                                            <p className="text-sm font-semibold text-green-800">
                                                Selected: {product.name}
                                            </p>
                                            <p className="text-xs text-green-600">
                                                Stock: {product.stock} | Price: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.sellingPrice)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">
                                Quantity
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                value={quantity}
                                onChange={(e) => {
                                    setQuantity(e.target.value);
                                    setError('');
                                    setSuccess('');
                                }}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="1"
                                min="1"
                                max={product?.stock}
                            />
                        </div>

                        {product && (
                             <div className="p-4 bg-slate-50 rounded-md text-slate-800">
                                <p className="font-semibold text-lg">
                                    Total Sale: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.sellingPrice * (parseInt(quantity, 10) || 0))}
                                </p>
                                <p className="text-sm text-slate-600">
                                    Profit for this sale: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((product.sellingPrice - product.purchasePrice) * (parseInt(quantity, 10) || 0))}
                                </p>
                             </div>
                        )}

                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {success && <p className="text-sm text-green-600">{success}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={!!success}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400"
                            >
                                {success ? 'Redirecting...' : 'Confirm Sale'}
                            </button>
                        </div>
                    </form>
                    </>
                ) : (
                    <div className="text-center">
                        <p className="text-slate-600">You need to add a product to your inventory before you can sell anything.</p>
                        <button onClick={() => navigate('/products')} className="mt-4 inline-block bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Go to Products
                        </button>
                    </div>
                )}
            </div>

            {scanMode === 'scan' && (
                <BarcodeScanner
                    products={products}
                    onProductScanned={handleProductScanned}
                    onError={handleScanError}
                />
            )}

            {showCameraScanner && (
                <CameraScanner
                    onScanSuccess={handleCameraScan}
                    onClose={() => setShowCameraScanner(false)}
                />
            )}
        </div>
    );
};

export default SellPage;
