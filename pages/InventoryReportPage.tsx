
import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { format, parseISO, startOfDay, isBefore, isEqual } from 'date-fns';
import type { Product, Transaction } from '../types';

const InventoryReportPage: React.FC = () => {
  const { products, transactions, loading } = useData();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const calculateInventoryAtDate = useMemo(() => {
    const targetDate = startOfDay(parseISO(selectedDate));

    const inventorySnapshot: { [productId: string]: Product & { calculatedStock: number } } = {};

    products.forEach(product => {
      inventorySnapshot[product.id] = {
        ...product,
        calculatedStock: product.stock
      };
    });

    const relevantTransactions = transactions.filter(tx => {
      if (!tx.productId) return false;
      const txDate = startOfDay(parseISO(tx.date));
      return isBefore(targetDate, txDate) || isEqual(targetDate, txDate);
    });

    relevantTransactions.forEach(tx => {
      if (tx.productId && tx.quantity && inventorySnapshot[tx.productId]) {
        inventorySnapshot[tx.productId].calculatedStock += tx.quantity;
      }
    });

    return Object.values(inventorySnapshot).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, transactions, selectedDate]);

  const totalInventoryValue = useMemo(() => {
    return calculateInventoryAtDate.reduce((sum, item) => {
      return sum + (item.purchasePrice * item.calculatedStock);
    }, 0);
  }, [calculateInventoryAtDate]);

  const totalPotentialRevenue = useMemo(() => {
    return calculateInventoryAtDate.reduce((sum, item) => {
      return sum + (item.sellingPrice * item.calculatedStock);
    }, 0);
  }, [calculateInventoryAtDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-center p-10">Loading inventory data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Inventory Report</h2>
        <p className="text-slate-600 mb-6">View your inventory snapshot as of a specific date.</p>

        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
              <label htmlFor="reportDate" className="block text-sm font-medium text-slate-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                id="reportDate"
                value={selectedDate}
                max={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full sm:w-auto rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors shadow-md"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>

      <div className="print:block">
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 print:shadow-none print:border-0">
          <div className="print:mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2 print:text-center">
              Inventory Report
            </h3>
            <p className="text-slate-600 text-center mb-6">
              As of {format(parseISO(selectedDate), 'MMMM dd, yyyy')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 print:mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-1">Total Items</p>
              <p className="text-2xl font-bold text-blue-900">{calculateInventoryAtDate.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium mb-1">Inventory Value</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(totalInventoryValue)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 font-medium mb-1">Potential Revenue</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalPotentialRevenue)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Stock Qty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Purchase Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Total Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {calculateInventoryAtDate.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No inventory data available for this date.
                    </td>
                  </tr>
                ) : (
                  calculateInventoryAtDate.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-right font-semibold">
                        {item.calculatedStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-right">
                        {formatCurrency(item.purchasePrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-right">
                        {formatCurrency(item.sellingPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-semibold">
                        {formatCurrency(item.purchasePrice * item.calculatedStock)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {calculateInventoryAtDate.length > 0 && (
                <tfoot className="bg-slate-100 font-bold">
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900" colSpan={4}>
                      Total Inventory Value
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 text-right">
                      {formatCurrency(totalInventoryValue)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="hidden print:block mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500 text-center">
            Generated on {format(new Date(), 'MMMM dd, yyyy')} at {format(new Date(), 'h:mm a')}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default InventoryReportPage;
