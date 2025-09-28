
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import type { TransactionType, TransactionCategory } from '../types';
import { SALE_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';

const AddEntryPage: React.FC = () => {
  const { addTransaction } = useTransactions();
  const navigate = useNavigate();

  const [type, setType] = useState<TransactionType>('sale');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory>(SALE_CATEGORIES[0]);
  const [error, setError] = useState('');

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'sale' ? SALE_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) {
      setError('All fields are required.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid, positive amount.');
      return;
    }
    
    setError('');
    await addTransaction({
      type,
      amount: numericAmount,
      description,
      category,
    });
    
    navigate('/');
  };

  const categories = type === 'sale' ? SALE_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="max-w-xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Add New Entry</h2>
        <p className="text-slate-600 mb-8">Record a new sale or expense for your shop.</p>
      
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
            <div className="mb-6 grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => handleTypeChange('sale')}
                    className={`px-4 py-3 rounded-lg font-semibold text-center transition-colors ${
                    type === 'sale' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    Sale
                </button>
                <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`px-4 py-3 rounded-lg font-semibold text-center transition-colors ${
                    type === 'expense' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                    Expense
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
                        Amount
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="block w-full rounded-md border-slate-300 pl-7 pr-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="0.00"
                            step="0.01"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                    </label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder={type === 'sale' ? 'e.g., Coffee beans sale' : 'e.g., Electricity bill'}
                    />
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                        Category
                    </label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                            {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add Entry
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default AddEntryPage;
