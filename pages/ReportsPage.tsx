
import React, { useMemo } from 'react';
import { useData } from '../hooks/useData';
import { isToday, isThisWeek, parseISO } from 'date-fns';
import SummaryCard from '../components/SummaryCard';
import TransactionList from '../components/TransactionList';
import type { Transaction } from '../types';

const ReportsPage: React.FC = () => {
  const { transactions, loading, error } = useData();

  const calculateSummary = (filteredTransactions: Transaction[]) => {
    return filteredTransactions.reduce(
      (acc, tx) => {
        if (tx.type === 'sale') {
          acc.totalSales += tx.amount;
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

  const todayTransactions = useMemo(() => 
    transactions.filter(tx => isToday(parseISO(tx.date))), 
    [transactions]
  );
  const thisWeekTransactions = useMemo(() => 
    transactions.filter(tx => isThisWeek(parseISO(tx.date), { weekStartsOn: 1 })), 
    [transactions]
  );

  const todaySummary = useMemo(() => calculateSummary(todayTransactions), [todayTransactions]);
  const thisWeekSummary = useMemo(() => calculateSummary(thisWeekTransactions), [thisWeekTransactions]);

  if (loading) {
    return <div className="text-center p-10">Loading reports...</div>;
  }
  
  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Financial Reports</h2>
        <p className="text-slate-600">Review your daily and weekly performance.</p>
      </div>

      <div className="space-y-8">
        <SummaryCard 
          title="Today's Summary" 
          totalSales={todaySummary.totalSales} 
          totalExpenses={todaySummary.totalExpenses + todaySummary.cogs} 
        />
        <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Today's Transactions</h3>
            <TransactionList transactions={todayTransactions} />
        </div>
      </div>

      <div className="space-y-8">
        <SummaryCard 
          title="This Week's Summary" 
          totalSales={thisWeekSummary.totalSales} 
          totalExpenses={thisWeekSummary.totalExpenses + thisWeekSummary.cogs} 
        />
         <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">This Week's Transactions</h3>
            <TransactionList transactions={thisWeekTransactions} />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
