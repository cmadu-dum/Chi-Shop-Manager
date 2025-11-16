import React, { useMemo } from 'react';
import { useData } from '../hooks/useData';
import { calculateProductDemand, getRestockRecommendations } from '../utils/demandForecast';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon, AlertTriangleIcon, CheckCircleIcon } from '../components/icons';
import DemandForecastChart from '../components/DemandForecastChart';

const DemandForecastPage: React.FC = () => {
  const { products, transactions, loading } = useData();

  const demandAnalysis = useMemo(() => {
    if (products.length === 0) return { demands: [], prioritize: [], deprioritize: [] };

    const demands = calculateProductDemand(products, transactions);
    const { prioritize, deprioritize } = getRestockRecommendations(demands);

    return { demands, prioritize, deprioritize };
  }, [products, transactions]);

  const { demands, prioritize, deprioritize } = demandAnalysis;

  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUpIcon className="w-5 h-5 text-green-600" />;
      case 'decreasing':
        return <TrendingDownIcon className="w-5 h-5 text-red-600" />;
      default:
        return <MinusIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: 'critical' | 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getPriorityLabel = (priority: 'critical' | 'high' | 'medium' | 'low') => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading demand forecast...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Product Demand Forecast</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-gray-700">No products available. Add products to see demand forecasts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Product Demand Forecast</h1>
      <p className="text-gray-600 mb-6">Smart restocking suggestions based on sales trends and customer demand</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-600 mb-1">High Demand Products</h3>
          <p className="text-3xl font-bold text-green-600">
            {demands.filter(d => d.demandScore > 100).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Critical Restock Needed</h3>
          <p className="text-3xl font-bold text-red-600">
            {demands.filter(d => d.restockPriority === 'critical').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Low Demand Products</h3>
          <p className="text-3xl font-bold text-gray-600">
            {demands.filter(d => d.salesLast30Days === 0).length}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <DemandForecastChart demands={demands} />
      </div>

      {prioritize.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangleIcon className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-bold">Priority Restocking</h2>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Until Stockout</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales (7d / 30d)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Restock</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prioritize.map((demand) => (
                    <tr key={demand.product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{demand.product.name}</div>
                        <div className="text-sm text-gray-500">
                          ₦{demand.product.sellingPrice.toLocaleString()} | {demand.profitMargin.toFixed(1)}% margin
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-semibold ${demand.product.stock < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                          {demand.product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {demand.daysUntilStockout !== null ? (
                          <span className={`font-medium ${demand.daysUntilStockout <= 3 ? 'text-red-600' : demand.daysUntilStockout <= 7 ? 'text-orange-600' : 'text-gray-900'}`}>
                            {demand.daysUntilStockout} days
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <span className="font-medium">{demand.salesLast7Days}</span> / <span className="text-gray-600">{demand.salesLast30Days}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {demand.dailyAvgSales.toFixed(1)} units/day
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(demand.trend)}
                          <span className="text-sm capitalize">{demand.trend}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityColor(demand.restockPriority)}`}>
                          {getPriorityLabel(demand.restockPriority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-blue-600">{demand.restockSuggestion}</span>
                        <span className="text-sm text-gray-500"> units</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircleIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">All Products Demand Analysis</h2>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {demands.map((demand, index) => (
                  <tr key={demand.product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-bold ${index < 3 ? 'text-yellow-600' : 'text-gray-400'}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{demand.product.name}</div>
                      <div className="text-sm text-gray-500">
                        ₦{demand.product.sellingPrice.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-blue-600">{demand.demandScore}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${demand.product.stock < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                        {demand.product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium">{demand.totalSold} units</div>
                        <div className="text-gray-500">{demand.salesCount} transactions</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">₦{demand.totalRevenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{demand.profitMargin.toFixed(1)}% margin</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(demand.trend)}
                        <span className="text-sm capitalize">{demand.trend}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPriorityColor(demand.restockPriority)}`}>
                        {getPriorityLabel(demand.restockPriority)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deprioritize.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDownIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-bold">Low Priority / Deprioritize</h2>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales (30d)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deprioritize.map((demand) => {
                    let reason = '';
                    if (demand.salesLast30Days === 0) reason = 'No sales in 30 days';
                    else if (demand.trend === 'decreasing') reason = 'Decreasing demand';
                    else if (demand.product.stock > demand.restockSuggestion * 2) reason = 'Overstocked';

                    return (
                      <tr key={demand.product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{demand.product.name}</div>
                          <div className="text-sm text-gray-500">₦{demand.product.sellingPrice.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">{demand.product.stock}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-gray-600">{demand.salesLast30Days}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {getTrendIcon(demand.trend)}
                            <span className="text-sm capitalize">{demand.trend}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{reason}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandForecastPage;
