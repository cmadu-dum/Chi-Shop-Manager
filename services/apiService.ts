import type { Product, Transaction, RestockHistory } from '../types';
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
      stock: product.stock,
      weightedAvgCost: product.weighted_avg_cost ? Number(product.weighted_avg_cost) : undefined,
      lastRestockDate: product.last_restock_date,
      restockCount: product.restock_count,
      createdAt: product.created_at
    }));
  },

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const { data: existingProduct } = await supabase
      .from('products')
      .select('name')
      .ilike('name', product.name)
      .maybeSingle();

    if (existingProduct) {
      throw new Error(`A product with the name "${product.name}" already exists. Please use a unique name.`);
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        purchase_price: product.purchasePrice,
        selling_price: product.sellingPrice,
        stock: product.stock,
        weighted_avg_cost: product.purchasePrice,
        restock_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      purchasePrice: Number(data.purchase_price),
      sellingPrice: Number(data.selling_price),
      stock: data.stock,
      weightedAvgCost: Number(data.weighted_avg_cost),
      lastRestockDate: data.last_restock_date,
      restockCount: data.restock_count,
      createdAt: data.created_at
    };
  },

  async restock(productId: string, quantity: number, purchasePrice: number, sellingPrice: number, notes?: string): Promise<{ product: Product; restockHistory: RestockHistory }> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('User not authenticated');
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    const previousStock = product.stock;
    const previousAvgCost = Number(product.weighted_avg_cost) || Number(product.purchase_price);
    const newStock = previousStock + quantity;

    let newAvgCost: number;
    if (previousStock === 0) {
      newAvgCost = purchasePrice;
    } else {
      const currentValue = previousStock * previousAvgCost;
      const addedValue = quantity * purchasePrice;
      newAvgCost = (currentValue + addedValue) / newStock;
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock: newStock,
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
        weighted_avg_cost: newAvgCost,
        last_restock_date: new Date().toISOString(),
        restock_count: (product.restock_count || 0) + 1
      })
      .eq('id', productId);

    if (updateError) throw updateError;

    const { data: restockRecord, error: restockError } = await supabase
      .from('restock_history')
      .insert({
        product_id: productId,
        quantity_added: quantity,
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
        previous_stock: previousStock,
        new_stock: newStock,
        previous_avg_cost: previousAvgCost,
        new_avg_cost: newAvgCost,
        notes,
        user_id: session.session.user.id
      })
      .select()
      .single();

    if (restockError) throw restockError;

    return {
      product: {
        id: product.id,
        name: product.name,
        purchasePrice: purchasePrice,
        sellingPrice: sellingPrice,
        stock: newStock,
        weightedAvgCost: newAvgCost,
        lastRestockDate: restockRecord.created_at,
        restockCount: (product.restock_count || 0) + 1,
        createdAt: product.created_at
      },
      restockHistory: {
        id: restockRecord.id,
        productId: restockRecord.product_id,
        quantityAdded: restockRecord.quantity_added,
        purchasePrice: Number(restockRecord.purchase_price),
        sellingPrice: Number(restockRecord.selling_price),
        previousStock: restockRecord.previous_stock,
        newStock: restockRecord.new_stock,
        previousAvgCost: Number(restockRecord.previous_avg_cost),
        newAvgCost: Number(restockRecord.new_avg_cost),
        notes: restockRecord.notes,
        userId: restockRecord.user_id,
        createdAt: restockRecord.created_at
      }
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
      stock: data.stock,
      weightedAvgCost: data.weighted_avg_cost ? Number(data.weighted_avg_cost) : undefined,
      lastRestockDate: data.last_restock_date,
      restockCount: data.restock_count,
      createdAt: data.created_at
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
        stock: newStock,
        createdAt: product.created_at
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
