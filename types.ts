
export interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
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
