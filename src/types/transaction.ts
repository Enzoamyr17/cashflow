export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'Cash' | 'Gcash' | 'Seabank' | 'UBP' | 'Other Bank' | 'Others';

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  method: PaymentMethod;
  notes: string | null;
  date: string; // ISO date string
  is_planned: boolean;
  is_completed: boolean;
  created_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category_name: string | null;
  category_color: string | null;
}

export interface CreateTransactionInput {
  category_id: string | null;
  type: TransactionType;
  amount: number;
  method: PaymentMethod;
  notes?: string | null;
  date: string;
  is_planned?: boolean;
  is_completed?: boolean;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string;
}
