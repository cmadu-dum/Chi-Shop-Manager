
import React, { createContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { productApi, transactionApi, salesApi } from '../services/apiService';
import type { Transaction, Product } from '../types';
import { LOW_STOCK_THRESHOLD } from '../constants';

interface DataContextType {
  transactions: Transaction[];
  products: Product[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'productId' | 'quantity' | 'profit'>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  sellProduct: (productId: string, quantity: number) => Promise<void>;
  lowStockProducts: Product[];
  loading: boolean;
  error: string | null;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [storedTransactions, storedProducts] = await Promise.all([
            transactionApi.getAll(),
            productApi.getAll()
        ]);
        setTransactions(storedTransactions);
        setProducts(storedProducts);
      } catch (e) {
        setError('Failed to load data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date' | 'productId' | 'quantity' | 'profit'>) => {
    try {
      const newTransaction = await transactionApi.create(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (e) {
      setError('Failed to save transaction.');
      console.error(e);
      throw e;
    }
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    try {
        const newProduct = await productApi.create(product);
        setProducts(prev => [...prev, newProduct].sort((a,b) => a.name.localeCompare(b.name)));
    } catch (e) {
        setError('Failed to save product.');
        console.error(e);
        throw e;
    }
  }, []);

  const sellProduct = useCallback(async (productId: string, quantity: number) => {
    try {
        const { product: updatedProduct, transaction: newTransaction } = await salesApi.sell(productId, quantity);
        setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
        setTransactions(prev => [newTransaction, ...prev]);
    } catch(e) {
        setError('Failed to process sale.');
        console.error(e);
        throw e;
    }
  }, []);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock < LOW_STOCK_THRESHOLD);
  }, [products]);

  return (
    <DataContext.Provider value={{ transactions, products, addTransaction, addProduct, sellProduct, lowStockProducts, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};
