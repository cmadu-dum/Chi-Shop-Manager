
import localforage from 'localforage';
import type { Transaction, Product } from '../types';

const TRANSACTIONS_KEY = 'shop-manager-transactions';
const PRODUCTS_KEY = 'shop-manager-products';

localforage.config({
  name: 'ShopManagerDB',
  storeName: 'data',
  description: 'Stores shop data'
});

// Transactions ---
export const getTransactions = async (): Promise<Transaction[]> => {
  const transactions = await localforage.getItem<Transaction[]>(TRANSACTIONS_KEY);
  return transactions || [];
};

export const saveTransactions = async (transactions: Transaction[]): Promise<Transaction[]> => {
  return await localforage.setItem(TRANSACTIONS_KEY, transactions);
};

// Products ---
export const getProducts = async (): Promise<Product[]> => {
    const products = await localforage.getItem<Product[]>(PRODUCTS_KEY);
    return products || [];
}

export const saveProducts = async (products: Product[]): Promise<Product[]> => {
    return await localforage.setItem(PRODUCTS_KEY, products);
}
