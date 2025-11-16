import React, { useMemo } from 'react';
import { ProductDemand } from '../utils/demandForecast';

interface DemandForecastChartProps {
  demands: ProductDemand[];
}

const DemandForecastChart: React.FC<DemandForecastChartProps> = ({ demands }) => {
  const topProducts = useMemo(() => {
    return demands.slice(0, 10);
  }, [demands]);

  const maxScore = useMemo(() => {
    return Math.max(...topProducts.map(d => d.demandScore), 100);
  }, [topProducts]);

  const getTrendColor = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return 'bg-green-500';
      case 'decreasing':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getTrendBgColor = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return 'bg-green-50';
      case 'decreasing':
        return 'bg-red-50';
      default:
        return 'bg-yellow-50';
    }
  };

  if (topProducts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        No demand data available
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-6">Top 10 Products by Demand Score</h3>
      <div className="space-y-4">
        {topProducts.map((demand, index) => {
          const percentage = (demand.demandScore / maxScore) * 100;

          return (
            <div key={demand.product.id} className={`p-4 rounded-lg border-2 ${getTrendBgColor(demand.trend)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{demand.product.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Stock: {demand.product.stock}</span>
                      <span>•</span>
                      <span>Sold: {demand.totalSold} units</span>
                      <span>•</span>
                      <span className="capitalize">{demand.trend}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{demand.demandScore}</div>
                  <div className="text-xs text-gray-500">Demand Score</div>
                </div>
              </div>

              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full ${getTrendColor(demand.trend)} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 15 && (
                    <span className="text-white text-sm font-semibold">
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-white rounded-md p-2 border border-gray-200">
                  <div className="text-gray-600 text-xs">7-Day Sales</div>
                  <div className="font-semibold text-gray-900">{demand.salesLast7Days}</div>
                </div>
                <div className="bg-white rounded-md p-2 border border-gray-200">
                  <div className="text-gray-600 text-xs">30-Day Sales</div>
                  <div className="font-semibold text-gray-900">{demand.salesLast30Days}</div>
                </div>
                <div className="bg-white rounded-md p-2 border border-gray-200">
                  <div className="text-gray-600 text-xs">Daily Avg</div>
                  <div className="font-semibold text-gray-900">{demand.dailyAvgSales.toFixed(1)}</div>
                </div>
                <div className="bg-white rounded-md p-2 border border-gray-200">
                  <div className="text-gray-600 text-xs">
                    {demand.daysUntilStockout !== null ? 'Days to Stockout' : 'Status'}
                  </div>
                  <div className={`font-semibold ${demand.daysUntilStockout !== null && demand.daysUntilStockout <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                    {demand.daysUntilStockout !== null ? `${demand.daysUntilStockout}d` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Understanding Demand Score</h4>
        <p className="text-sm text-blue-800">
          The demand score combines recent sales velocity, trend direction, profit margins, and total revenue.
          Higher scores indicate products with strong customer demand that should be prioritized for restocking.
        </p>
      </div>
    </div>
  );
};

export default DemandForecastChart;
