
export type TransactionType = 'sale' | 'expense';

export type SaleCategory = 'Product Sale' | 'Service' | 'Other';
export type ExpenseCategory = 'Supplies' | 'Rent' | 'Salaries' | 'Utilities' | 'Food' | 'Other';
export type TransactionCategory = SaleCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: TransactionCategory;
  date: string; // ISO 8601 string
}
