
import React, { useMemo } from 'react';
import { useData } from '../hooks/useData';
import SummaryCard from '../components/SummaryCard';
import TransactionList from '../components/TransactionList';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, BoxIcon } from '../components/icons';
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
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-md shadow-sm" role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangleIcon className="h-6 w-6 text-orange-500 mr-4"/></div>
            <div>
              <p className="font-bold">Low Stock Alert</p>
              <p className="text-sm">
                You have {lowStockProducts.length} item(s) running low. 
                <Link to="/products" className="font-medium underline ml-2">View Products</Link>
              </p>
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
