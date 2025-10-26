import type { Product, Transaction } from '../types';
import { supabase } from '../lib/supabase';

export const productApi = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return data.map(product => ({
      id: product.id,
      name: product.name,
      purchasePrice: Number(product.purchase_price),
      sellingPrice: Number(product.selling_price),
      stock: product.stock
    }));
  },

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        purchase_price: product.purchasePrice,
        selling_price: product.sellingPrice,
        stock: product.stock
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      purchasePrice: Number(data.purchase_price),
      sellingPrice: Number(data.selling_price),
      stock: data.stock
    };
  },

  async update(id: string, product: Partial<Omit<Product, 'id'>>): Promise<Product> {
    const updates: any = {};
    if (product.name !== undefined) updates.name = product.name;
    if (product.purchasePrice !== undefined) updates.purchase_price = product.purchasePrice;
    if (product.sellingPrice !== undefined) updates.selling_price = product.sellingPrice;
    if (product.stock !== undefined) updates.stock = product.stock;

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      purchasePrice: Number(data.purchase_price),
      sellingPrice: Number(data.selling_price),
      stock: data.stock
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const transactionApi = {
  async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(transaction => ({
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      productId: transaction.product_id,
      quantity: transaction.quantity,
      profit: transaction.profit ? Number(transaction.profit) : undefined
    }));
  },

  async create(transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: new Date().toISOString(),
        product_id: transaction.productId,
        quantity: transaction.quantity,
        profit: transaction.profit
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      type: data.type,
      amount: Number(data.amount),
      description: data.description,
      category: data.category,
      date: data.date,
      productId: data.product_id,
      quantity: data.quantity,
      profit: data.profit ? Number(data.profit) : undefined
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const salesApi = {
  async sell(productId: string, quantity: number): Promise<{ product: Product; transaction: Transaction }> {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    if (product.stock < quantity) {
      throw new Error('Insufficient stock');
    }

    const newStock = product.stock - quantity;
    const saleAmount = Number(product.selling_price) * quantity;
    const profit = (Number(product.selling_price) - Number(product.purchase_price)) * quantity;

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (updateError) throw updateError;

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        type: 'sale',
        amount: saleAmount,
        description: `Sold ${quantity} x ${product.name}`,
        category: 'Product Sale',
        date: new Date().toISOString(),
        product_id: productId,
        quantity,
        profit
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    return {
      product: {
        id: product.id,
        name: product.name,
        purchasePrice: Number(product.purchase_price),
        sellingPrice: Number(product.selling_price),
        stock: newStock
      },
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: Number(transaction.amount),
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        productId: transaction.product_id,
        quantity: transaction.quantity,
        profit: Number(transaction.profit)
      }
    };
  },
};
