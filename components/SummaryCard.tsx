
import React from 'react';
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from './icons';

interface SummaryCardProps {
  title: string;
  totalSales: number;
  totalExpenses: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, totalSales, totalExpenses }) => {
  const netProfit = totalSales - totalExpenses;
  const isProfit = netProfit >= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUpIcon className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-slate-600">Total Sales</span>
          </div>
          <span className="font-medium text-green-600">{formatCurrency(totalSales)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <TrendingDownIcon className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-slate-600">Total Expenses</span>
          </div>
          <span className="font-medium text-red-600">{formatCurrency(totalExpenses)}</span>
        </div>
        <hr className="border-slate-200 my-2" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className={`${isProfit ? 'bg-blue-100' : 'bg-orange-100'} p-2 rounded-full`}>
                <DollarSignIcon className={`h-5 w-5 ${isProfit ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <span className="font-semibold text-slate-800">{isProfit ? 'Net Profit' : 'Net Loss'}</span>
          </div>
          <span className={`font-bold text-lg ${isProfit ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatCurrency(netProfit)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
