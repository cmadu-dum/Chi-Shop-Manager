
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { format, parseISO, startOfDay, endOfDay, isBefore, isAfter, isWithinInterval } from 'date-fns';
import type { Product, Transaction, RestockHistory } from '../types';
import { supabase } from '../lib/supabase';

interface InventoryMovement {
  productId: string;
  productName: string;
  openingStock: number;
  purchases: number;
  sales: number;
  closingStock: number;
  unitCost: number;
  unitPrice: number;
  openingValue: number;
  purchaseValue: number;
  closingValue: number;
}

const InventoryReportPage: React.FC = () => {
  const { products, transactions, loading } = useData();
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [restockHistory, setRestockHistory] = useState<RestockHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const loadRestockHistory = async () => {
      setLoadingHistory(true);
      try {
        const { data, error } = await supabase
          .from('restock_history')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        const history: RestockHistory[] = data.map(record => ({
          id: record.id,
          productId: record.product_id,
          quantityAdded: record.quantity_added,
          purchasePrice: Number(record.purchase_price),
          sellingPrice: Number(record.selling_price),
          previousStock: record.previous_stock,
          newStock: record.new_stock,
          previousAvgCost: Number(record.previous_avg_cost),
          newAvgCost: Number(record.new_avg_cost),
          notes: record.notes,
          userId: record.user_id,
          createdAt: record.created_at
        }));

        setRestockHistory(history);
      } catch (e) {
        console.error('Failed to load restock history:', e);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadRestockHistory();
  }, []);

  const inventoryReport = useMemo(() => {
    const reportStart = startOfDay(parseISO(startDate));
    const reportEnd = endOfDay(parseISO(endDate));

    const movements: { [productId: string]: InventoryMovement } = {};

    products.forEach(product => {
      const currentStock = product.stock;

      const salesInPeriod = transactions.filter(tx => {
        if (!tx.productId || tx.productId !== product.id || tx.type !== 'sale') return false;
        const txDate = parseISO(tx.date);
        return isWithinInterval(txDate, { start: reportStart, end: reportEnd });
      });

      const restocksInPeriod = restockHistory.filter(restock => {
        if (restock.productId !== product.id) return false;
        const restockDate = parseISO(restock.createdAt);
        return isWithinInterval(restockDate, { start: reportStart, end: reportEnd });
      });

      const totalSales = salesInPeriod.reduce((sum, tx) => sum + (tx.quantity || 0), 0);
      const totalPurchases = restocksInPeriod.reduce((sum, restock) => sum + restock.quantityAdded, 0);

      const openingStock = currentStock - totalPurchases + totalSales;
      const closingStock = currentStock;

      const avgCost = product.weightedAvgCost || product.purchasePrice;

      movements[product.id] = {
        productId: product.id,
        productName: product.name,
        openingStock: Math.max(0, openingStock),
        purchases: totalPurchases,
        sales: totalSales,
        closingStock: closingStock,
        unitCost: avgCost,
        unitPrice: product.sellingPrice,
        openingValue: Math.max(0, openingStock) * avgCost,
        purchaseValue: restocksInPeriod.reduce((sum, r) => sum + (r.quantityAdded * r.purchasePrice), 0),
        closingValue: closingStock * avgCost
      };
    });

    return Object.values(movements).sort((a, b) => a.productName.localeCompare(b.productName));
  }, [products, transactions, restockHistory, startDate, endDate]);

  const totals = useMemo(() => {
    return inventoryReport.reduce((acc, item) => ({
      openingValue: acc.openingValue + item.openingValue,
      purchaseValue: acc.purchaseValue + item.purchaseValue,
      closingValue: acc.closingValue + item.closingValue,
      totalSales: acc.totalSales + item.sales,
      totalPurchases: acc.totalPurchases + item.purchases
    }), { openingValue: 0, purchaseValue: 0, closingValue: 0, totalSales: 0, totalPurchases: 0 });
  }, [inventoryReport]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || loadingHistory) {
    return <div className="text-center p-10">Loading inventory data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Inventory Report</h2>
        <p className="text-slate-600 mb-6">View inventory movements and stock levels for a specific period.</p>

        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  min={startDate}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
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
              Inventory Movement Report
            </h3>
            <p className="text-slate-600 text-center mb-6">
              Period: {format(parseISO(startDate), 'MMM dd, yyyy')} - {format(parseISO(endDate), 'MMM dd, yyyy')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 print:mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-1">Opening Value</p>
              <p className="text-xl font-bold text-blue-900">{formatCurrency(totals.openingValue)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium mb-1">Purchases</p>
              <p className="text-xl font-bold text-green-900">{formatCurrency(totals.purchaseValue)}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600 font-medium mb-1">Units Sold</p>
              <p className="text-xl font-bold text-slate-900">{totals.totalSales}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-600 font-medium mb-1">Units Bought</p>
              <p className="text-xl font-bold text-orange-900">{totals.totalPurchases}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-600 font-medium mb-1">Closing Value</p>
              <p className="text-xl font-bold text-emerald-900">{formatCurrency(totals.closingValue)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Opening Stock
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Purchases
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Closing Stock
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Unit Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Opening Value
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Purchase Value
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Closing Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {inventoryReport.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                      No inventory data available for this period.
                    </td>
                  </tr>
                ) : (
                  inventoryReport.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right">
                        {item.openingStock}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-700 text-right font-medium">
                        {item.purchases > 0 ? `+${item.purchases}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-700 text-right font-medium">
                        {item.sales > 0 ? `-${item.sales}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right font-semibold">
                        {item.closingStock}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right">
                        {formatCurrency(item.openingValue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 text-right">
                        {formatCurrency(item.purchaseValue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right font-semibold">
                        {formatCurrency(item.closingValue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {inventoryReport.length > 0 && (
                <tfoot className="bg-slate-100 font-bold">
                  <tr>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      TOTAL
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right" colSpan={4}></td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right"></td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right">
                      {formatCurrency(totals.openingValue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right">
                      {formatCurrency(totals.purchaseValue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right">
                      {formatCurrency(totals.closingValue)}
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
