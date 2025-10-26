import type { Product, Transaction } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const productApi = {
  async getAll(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/api/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  async update(id: string, product: Partial<Omit<Product, 'id'>>): Promise<Product> {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
  },
};

export const transactionApi = {
  async getAll(): Promise<Transaction[]> {
    const response = await fetch(`${API_URL}/api/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  async create(transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
    const response = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
  },
};

export const salesApi = {
  async sell(productId: string, quantity: number): Promise<{ product: Product; transaction: Transaction }> {
    const response = await fetch(`${API_URL}/api/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process sale');
    }
    return response.json();
  },
};
