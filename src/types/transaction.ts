export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'Cash' | 'Gcash' | 'Seabank' | 'UBP' | 'Others';

export interface Transaction {
  id: string;
  user_id: string;
  categories:{
    id: string;
    name: string;
    color: string;
    is_budgeted: boolean;
  }
  type: "income" | "expense";
  amount: number;
  method: PaymentMethod;
  notes: string;
  date: string;
  created_at: string;
  is_completed: boolean;
  is_planned: boolean;
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

export type TransactionWithCategory = Transaction;
