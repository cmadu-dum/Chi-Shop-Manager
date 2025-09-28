
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getTransactions, addTransaction as saveTransaction } from '../services/storageService';
import type { Transaction } from '../types';

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

interface TransactionsProviderProps {
  children: ReactNode;
}

export const TransactionsProvider: React.FC<TransactionsProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const storedTransactions = await getTransactions();
        setTransactions(storedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (e) {
        setError('Failed to load transactions.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    try {
      setError(null);
      const newTransaction: Transaction = {
        ...transaction,
        id: new Date().getTime().toString(),
        date: new Date().toISOString(),
      };
      await saveTransaction(newTransaction);
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (e) {
      setError('Failed to save transaction.');
      console.error(e);
    }
  }, []);

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction, loading, error }}>
      {children}
    </TransactionsContext.Provider>
  );
};
