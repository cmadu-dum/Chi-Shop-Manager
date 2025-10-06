
import React, { createContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { getTransactions, saveTransactions, getProducts, saveProducts } from '../services/storageService';
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
            getTransactions(),
            getProducts()
        ]);
        setTransactions(storedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setProducts(storedProducts.sort((a, b) => a.name.localeCompare(b.name)));
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
      const newTransaction: Transaction = {
        ...transaction,
        id: new Date().getTime().toString(),
        date: new Date().toISOString(),
      };
      const updatedTransactions = [newTransaction, ...transactions];
      await saveTransactions(updatedTransactions);
      setTransactions(updatedTransactions);
    } catch (e) {
      setError('Failed to save transaction.');
      console.error(e);
      throw e;
    }
  }, [transactions]);

  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    try {
        const newProduct: Product = {
            ...product,
            id: new Date().getTime().toString()
        };
        const updatedProducts = [...products, newProduct].sort((a,b) => a.name.localeCompare(b.name));
        await saveProducts(updatedProducts);
        setProducts(updatedProducts);
    } catch (e) {
        setError('Failed to save product.');
        console.error(e);
        throw e;
    }
  }, [products]);

  const sellProduct = useCallback(async (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
        throw new Error('Product not found.');
    }
    if (product.stock < quantity) {
        throw new Error('Insufficient stock.');
    }

    const updatedStock = product.stock - quantity;
    const updatedProduct = { ...product, stock: updatedStock };

    const updatedProducts = products.map(p => p.id === productId ? updatedProduct : p);

    const saleTransaction: Omit<Transaction, 'id' | 'date'> = {
        type: 'sale',
        amount: product.sellingPrice * quantity,
        description: `Sold ${quantity} x ${product.name}`,
        category: 'Product Sale',
        productId: product.id,
        quantity: quantity,
        profit: (product.sellingPrice - product.purchasePrice) * quantity
    };
    
    const newTransaction: Transaction = {
        ...saleTransaction,
        id: new Date().getTime().toString(),
        date: new Date().toISOString(),
    };
    const updatedTransactions = [newTransaction, ...transactions];

    try {
        await Promise.all([
            saveProducts(updatedProducts),
            saveTransactions(updatedTransactions)
        ]);
        setProducts(updatedProducts);
        setTransactions(updatedTransactions);
    } catch(e) {
        setError('Failed to process sale.');
        console.error(e);
        throw e;
    }
  }, [products, transactions]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock < LOW_STOCK_THRESHOLD);
  }, [products]);

  return (
    <DataContext.Provider value={{ transactions, products, addTransaction, addProduct, sellProduct, lowStockProducts, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};
