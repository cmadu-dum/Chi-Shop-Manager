import React from 'react';
import { useData } from '../hooks/useData';
import { LOW_STOCK_THRESHOLD } from '../constants';
import { AlertTriangleIcon } from '../components/icons';

const LowStockPage: React.FC = () => {
    const { products, loading } = useData();

    const lowStockProducts = products.filter(p => p.stock < LOW_STOCK_THRESHOLD);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8 print:mb-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Low Stock Report</h2>
                    <p className="text-slate-600">Products that need restocking (below {LOW_STOCK_THRESHOLD} units)</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm print:hidden"
                >
                    Print Report
                </button>
            </div>

            {loading ? (
                <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
                    <p className="text-slate-500">Loading products...</p>
                </div>
            ) : lowStockProducts.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
                    <div className="text-center">
                        <p className="text-lg text-slate-700 mb-2">All products are well-stocked!</p>
                        <p className="text-sm text-slate-500">No items below the {LOW_STOCK_THRESHOLD} unit threshold.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                    <div className="hidden print:block p-6 border-b border-slate-200">
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">Low Stock Report</h1>
                        <p className="text-sm text-slate-600">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                        <p className="text-sm text-slate-600 mt-1">Threshold: {LOW_STOCK_THRESHOLD} units</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Product Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Current Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Purchase Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Selling Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider print:hidden">
                                        Restock Needed
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {lowStockProducts.map(product => {
                                    const restock = LOW_STOCK_THRESHOLD - product.stock + 20;
                                    return (
                                        <tr key={product.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-slate-900">{product.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-lg font-bold text-orange-600">{product.stock}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                                                {formatCurrency(product.purchasePrice)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                                                {formatCurrency(product.sellingPrice)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    <AlertTriangleIcon className="h-3 w-3" />
                                                    Low Stock
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium print:hidden">
                                                ~{restock} units
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-slate-600">
                                <span className="font-medium text-slate-900">{lowStockProducts.length}</span> product{lowStockProducts.length !== 1 ? 's' : ''} need{lowStockProducts.length === 1 ? 's' : ''} restocking
                            </p>
                            <p className="text-sm text-slate-600">
                                Estimated restock cost: <span className="font-bold text-slate-900">
                                    {formatCurrency(
                                        lowStockProducts.reduce((sum, p) => {
                                            const restockQty = LOW_STOCK_THRESHOLD - p.stock + 20;
                                            return sum + (restockQty * p.purchasePrice);
                                        }, 0)
                                    )}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:block {
                        display: block !important;
                    }
                    .print\\:mb-4 {
                        margin-bottom: 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default LowStockPage;
