
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';

const SellPage: React.FC = () => {
    const { products, sellProduct } = useData();
    const navigate = useNavigate();

    const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.id || '');
    const [quantity, setQuantity] = useState('1');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    const product = products.find(p => p.id === selectedProduct);

    return (
        <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Record a Sale</h2>
            <p className="text-slate-600 mb-8">Sell an item from your inventory.</p>
        
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
                {products.length > 0 ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                ) : (
                    <div className="text-center">
                        <p className="text-slate-600">You need to add a product to your inventory before you can sell anything.</p>
                        <button onClick={() => navigate('/products')} className="mt-4 inline-block bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Go to Products
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellPage;
