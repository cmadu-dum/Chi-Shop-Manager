import { supabase } from '../lib/supabase';
import type { RestockHistory, PriceHistoryPoint } from '../types';

export const restockApi = {
  async getHistory(productId: string): Promise<RestockHistory[]> {
    const { data, error } = await supabase
      .from('restock_history')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(record => ({
      id: record.id,
      productId: record.product_id,
      quantityAdded: record.quantity_added,
      purchasePrice: Number(record.purchase_price),
      sellingPrice: Number(record.selling_price),
      previousStock: record.previous_stock,
      newStock: record.new_stock,
      previousAvgCost: Number(record.previous_avg_cost),
      newAvgCost: Number(record.new_avg_cost),
      supplier: record.supplier,
      notes: record.notes,
      userId: record.user_id,
      createdAt: record.created_at
    }));
  },

  async getAllHistory(): Promise<RestockHistory[]> {
    const { data, error } = await supabase
      .from('restock_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(record => ({
      id: record.id,
      productId: record.product_id,
      quantityAdded: record.quantity_added,
      purchasePrice: Number(record.purchase_price),
      sellingPrice: Number(record.selling_price),
      previousStock: record.previous_stock,
      newStock: record.new_stock,
      previousAvgCost: Number(record.previous_avg_cost),
      newAvgCost: Number(record.new_avg_cost),
      supplier: record.supplier,
      notes: record.notes,
      userId: record.user_id,
      createdAt: record.created_at
    }));
  },

  async getPriceHistory(productId: string): Promise<PriceHistoryPoint[]> {
    const history = await this.getHistory(productId);

    return history.map(record => ({
      date: record.createdAt,
      purchasePrice: record.purchasePrice,
      sellingPrice: record.sellingPrice,
      avgCost: record.newAvgCost,
      quantity: record.quantityAdded
    }));
  }
};
