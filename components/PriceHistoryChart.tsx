import React, { useState, useEffect } from 'react';
import { restockApi } from '../services/restockService';
import type { PriceHistoryPoint } from '../types';
import { format } from 'date-fns';

interface PriceHistoryChartProps {
  productId: string;
  productName: string;
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ productId, productName }) => {
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const data = await restockApi.getPriceHistory(productId);
        setHistory(data.reverse());
      } catch (error) {
        console.error('Failed to load price history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [productId]);

  if (loading) {
    return <div className="text-slate-500">Loading price history...</div>;
  }

  if (history.length === 0) {
    return <div className="text-slate-500">No restock history available yet.</div>;
  }

  const maxPrice = Math.max(...history.map(h => Math.max(h.purchasePrice, h.sellingPrice)));
  const minPrice = Math.min(...history.map(h => Math.min(h.purchasePrice, h.avgCost)));
  const priceRange = maxPrice - minPrice;

  const getY = (price: number) => {
    const padding = priceRange * 0.1;
    return ((maxPrice + padding - price) / (priceRange + 2 * padding)) * 100;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">{productName} - Price History</h3>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="100" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="0.2" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#e2e8f0" strokeWidth="0.2" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.2" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeWidth="0.2" />

            <polyline
              points={history.map((h, i) => {
                const x = (i / (history.length - 1)) * 100;
                const y = getY(h.sellingPrice);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="0.5"
            />

            <polyline
              points={history.map((h, i) => {
                const x = (i / (history.length - 1)) * 100;
                const y = getY(h.purchasePrice);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.5"
            />

            <polyline
              points={history.map((h, i) => {
                const x = (i / (history.length - 1)) * 100;
                const y = getY(h.avgCost);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="0.5"
              strokeDasharray="1,1"
            />
          </svg>
        </div>

        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-green-600"></div>
            <span className="text-slate-600">Selling Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-blue-600"></div>
            <span className="text-slate-600">Purchase Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-amber-600" style={{backgroundImage: 'linear-gradient(to right, #f59e0b 50%, transparent 50%)', backgroundSize: '8px 2px'}}></div>
            <span className="text-slate-600">Avg Cost</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Quantity</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Purchase</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Selling</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Avg Cost</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {history.slice().reverse().map((point, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-900">
                  {format(new Date(point.date), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-4 py-3 text-sm text-slate-900 text-right">
                  {point.quantity}
                </td>
                <td className="px-4 py-3 text-sm text-blue-600 text-right font-medium">
                  ${point.purchasePrice.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-green-600 text-right font-medium">
                  ${point.sellingPrice.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-amber-600 text-right font-medium">
                  ${point.avgCost.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceHistoryChart;
