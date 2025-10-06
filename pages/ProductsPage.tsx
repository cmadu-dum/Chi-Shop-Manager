
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { LOW_STOCK_THRESHOLD } from '../constants';
import { AlertTriangleIcon } from '../components/icons';

const ProductsPage: React.FC = () => {
    const { products, addProduct, loading } = useData();
    const [name, setName] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [stock, setStock] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
                stock: st
            });
            setSuccess(`Product "${name}" added successfully!`);
            // Reset form
            setName('');
            setPurchasePrice('');
            setSellingPrice('');
            setStock('');
        } catch (err) {
            setError('Failed to add product. Please try again.');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Add Product</h2>
                <p className="text-slate-600 mb-8">Add a new item to your inventory.</p>
                <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 sticky top-24">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g., Coffee Beans"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="purchasePrice" className="block text-sm font-medium text-slate-700 mb-1">Purchase Price ($)</label>
                                <input type="number" id="purchasePrice" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="10.00" step="0.01"/>
                            </div>
                            <div>
                                <label htmlFor="sellingPrice" className="block text-sm font-medium text-slate-700 mb-1">Selling Price ($)</label>
                                <input type="number" id="sellingPrice" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="15.00" step="0.01"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-1">Initial Stock Quantity</label>
                            <input type="number" id="stock" value={stock} onChange={e => setStock(e.target.value)} className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="50" step="1"/>
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
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Current Inventory</h2>
                <p className="text-slate-600 mb-8">A list of all products in your shop.</p>
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    {loading ? <p className="p-4 text-slate-500">Loading products...</p> : (
                        <ul className="divide-y divide-slate-200">
                           {products.length === 0 && <li className="p-4 text-center text-slate-500">No products found. Add one to get started!</li>}
                            {products.map(p => {
                                const isLowStock = p.stock < LOW_STOCK_THRESHOLD;
                                const profit = p.sellingPrice - p.purchasePrice;

                                return (
                                <li key={p.id} className={`p-4 ${isLowStock ? 'bg-orange-50' : ''}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-800">{p.name}</p>
                                            <p className="text-sm text-slate-500">
                                                <span>Price: <span className="font-medium text-slate-700">{formatCurrency(p.sellingPrice)}</span></span> &bull; 
                                                <span> Cost: <span className="font-medium text-slate-700">{formatCurrency(p.purchasePrice)}</span></span> &bull;
                                                <span> Profit: <span className="font-medium text-green-600">{formatCurrency(profit)}</span></span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-lg ${isLowStock ? 'text-orange-600' : 'text-slate-800'}`}>{p.stock}</p>
                                            <p className="text-sm text-slate-500">in stock</p>
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
            </div>
        </div>
    );
};

export default ProductsPage;
