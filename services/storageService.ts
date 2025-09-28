
import localforage from 'localforage';
import type { Transaction } from '../types';

const TRANSACTIONS_KEY = 'shop-manager-transactions';

localforage.config({
  name: 'ShopManagerDB',
  storeName: 'transactions',
  description: 'Stores shop sales and expenses data'
});

export const getTransactions = async (): Promise<Transaction[]> => {
  const transactions = await localforage.getItem<Transaction[]>(TRANSACTIONS_KEY);
  return transactions || [];
};

export const saveTransactions = async (transactions: Transaction[]): Promise<Transaction[]> => {
  return await localforage.setItem(TRANSACTIONS_KEY, transactions);
};

export const addTransaction = async (transaction: Transaction): Promise<Transaction> => {
  const transactions = await getTransactions();
  const updatedTransactions = [...transactions, transaction];
  await saveTransactions(updatedTransactions);
  return transaction;
};
