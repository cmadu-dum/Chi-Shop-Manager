
import React, { useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import SummaryCard from '../components/SummaryCard';
import TransactionList from '../components/TransactionList';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { transactions, loading, error } = useTransactions();

  const allTimeSummary = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === 'sale') {
          acc.totalSales += tx.amount;
        } else {
          acc.totalExpenses += tx.amount;
        }
        return acc;
      },
      { totalSales: 0, totalExpenses: 0 }
    );
  }, [transactions]);

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
        <p className="text-slate-600">Here's your shop's financial overview.</p>
      </div>

      <SummaryCard 
        title="All-Time Summary" 
        totalSales={allTimeSummary.totalSales} 
        totalExpenses={allTimeSummary.totalExpenses}
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
            <p className="text-slate-500 mt-2 mb-4">Start by adding your first sale or expense.</p>
            <Link 
              to="/add" 
              className="inline-block bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Entry
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
