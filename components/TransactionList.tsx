
import React from 'react';
import { format, parseISO } from 'date-fns';
import type { Transaction } from '../types';
import { TrendingUpIcon, TrendingDownIcon } from './icons';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, limit }) => {
  const transactionsToDisplay = limit ? transactions.slice(0, limit) : transactions;

  if (transactionsToDisplay.length === 0) {
    return <p className="text-slate-500 text-center py-8">No transactions found.</p>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <ul className="divide-y divide-slate-200">
        {transactionsToDisplay.map((tx) => (
            <li key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${tx.type === 'sale' ? 'bg-green-100' : 'bg-red-100'}`}>
                {tx.type === 'sale' ? (
                    <TrendingUpIcon className="h-5 w-5 text-green-600" />
                ) : (
                    <TrendingDownIcon className="h-5 w-5 text-red-600" />
                )}
                </div>
                <div>
                <p className="font-medium text-slate-800">{tx.description}</p>
                <p className="text-sm text-slate-500">
                    {format(parseISO(tx.date), 'MMM d, yyyy')} &bull; {tx.category}
                </p>
                </div>
            </div>
            <span className={`font-semibold ${tx.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.type === 'sale' ? '+' : '-'}
                {formatCurrency(tx.amount)}
            </span>
            </li>
        ))}
        </ul>
    </div>
  );
};

export default TransactionList;
