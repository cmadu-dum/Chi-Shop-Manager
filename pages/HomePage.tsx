
import React, { useMemo } from 'react';
import { useData } from '../hooks/useData';
import SummaryCard from '../components/SummaryCard';
import TransactionList from '../components/TransactionList';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, BoxIcon, ActivityIcon } from '../components/icons';
import type { Transaction } from '../types';

const HomePage: React.FC = () => {
  const { transactions, lowStockProducts, loading, error } = useData();

  const calculateSummary = (txs: Transaction[]) => {
    return txs.reduce(
      (acc, tx) => {
        if (tx.type === 'sale') {
          acc.totalSales += tx.amount;
          // Cost of goods sold is the sale amount minus the profit recorded for that sale
          if (tx.profit !== undefined) {
             acc.cogs += (tx.amount - tx.profit);
          }
        } else {
          acc.totalExpenses += tx.amount;
        }
        return acc;
      },
      { totalSales: 0, totalExpenses: 0, cogs: 0 }
    );
  };

  const allTimeSummary = useMemo(() => calculateSummary(transactions), [transactions]);

  if (loading) {
    return <div className="text-center p-10">Loading data...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
        <p className="text-slate-600">Here's your shop's financial and inventory overview.</p>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400 rounded-xl shadow-lg p-6 animate-pulse" role="alert">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-orange-500 rounded-full p-3">
              <AlertTriangleIcon className="h-8 w-8 text-white"/>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-orange-800 mb-2">Low Stock Alert!</h3>
              <p className="text-orange-700 mb-3">
                {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's are' : ' is'} running low on inventory. Restock soon to avoid stockouts!
              </p>
              <div className="space-y-2 mb-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between bg-white/70 rounded-lg px-4 py-2 border border-orange-200">
                    <div className="flex items-center gap-2">
                      <BoxIcon className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-slate-800">{product.name}</span>
                    </div>
                    <span className="text-sm font-bold text-orange-600">
                      Only {product.stock} left
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Link
                  to="/products"
                  className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors shadow-md"
                >
                  Manage Inventory
                </Link>
                <Link
                  to="/demand-forecast"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors shadow-md"
                >
                  <ActivityIcon className="h-5 w-5" />
                  View Demand Forecast
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <SummaryCard 
        title="All-Time Summary" 
        totalSales={allTimeSummary.totalSales} 
        totalExpenses={allTimeSummary.totalExpenses + allTimeSummary.cogs}
      />

      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-800">Recent Transactions</h3>
            {transactions.length > 0 && (
                 <Link to="/reports" className="text-sm font-medium text-blue-600 hover:underline">
                    View All
                </Link>
            )}
        </div>
        {transactions.length > 0 ? (
          <TransactionList transactions={transactions} limit={5} />
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md border border-slate-200">
            <h3 className="text-lg font-medium text-slate-800">No transactions yet!</h3>
            <p className="text-slate-500 mt-2 mb-4">Start by adding a product or recording a sale.</p>
            <div className="flex justify-center gap-4">
                <Link 
                    to="/products" 
                    className="inline-flex items-center gap-2 bg-slate-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                    <BoxIcon className="h-5 w-5" /> Add a Product
                </Link>
                <Link 
                    to="/add" 
                    className="inline-block bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add Expense/Service
                </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
