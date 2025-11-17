
export interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  barcode?: string;
  weightedAvgCost?: number;
  lastRestockDate?: string;
  restockCount?: number;
  createdAt?: string;
}

export interface RestockHistory {
  id: string;
  productId: string;
  quantityAdded: number;
  purchasePrice: number;
  sellingPrice: number;
  previousStock: number;
  newStock: number;
  previousAvgCost: number;
  newAvgCost: number;
  supplier?: string;
  notes?: string;
  userId: string;
  createdAt: string;
}

export interface PriceHistoryPoint {
  date: string;
  purchasePrice: number;
  sellingPrice: number;
  avgCost: number;
  quantity: number;
}

export type TransactionType = 'sale' | 'expense';

export type SaleCategory = 'Service' | 'Other';
export type ExpenseCategory = 'Supplies' | 'Rent' | 'Salaries' | 'Utilities' | 'Food' | 'Other';
export type TransactionCategory = SaleCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: TransactionCategory | 'Product Sale';
  date: string; // ISO 8601 string

  // Fields for product sales
  productId?: string;
  quantity?: number;
  profit?: number;
}
