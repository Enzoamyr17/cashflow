import { supabase } from '@/lib/supabaseClient';
import {
  Transaction,
  TransactionWithCategory,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionType,
} from '@/types';

/**
 * Get all transactions for a user with optional filters
 */
export async function getTransactions(
  userId: string,
  filters?: {
    type?: TransactionType;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    isPlanned?: boolean;
    isCompleted?: boolean;
  }
): Promise<TransactionWithCategory[]> {
  let query = supabase
    .from('transactions')
    .select(
      `
      *,
      categories:category_id (
        name,
        color
      )
    `
    )
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.startDate) {
    query = query.gte('date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('date', filters.endDate);
  }

  if (filters?.isPlanned !== undefined) {
    query = query.eq('is_planned', filters.isPlanned);
  }

  if (filters?.isCompleted !== undefined) {
    query = query.eq('is_completed', filters.isCompleted);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  // Transform data to include category info
  return (data || []).map((t: any) => ({
    ...t,
    category_name: t.categories?.name || null,
    category_color: t.categories?.color || null,
  })) as TransactionWithCategory[];
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }

  return data as Transaction;
}

/**
 * Create new transaction
 */
export async function createTransaction(
  userId: string,
  input: CreateTransactionInput
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: userId,
        category_id: input.category_id,
        type: input.type,
        amount: input.amount,
        method: input.method,
        notes: input.notes || null,
        date: input.date,
        is_planned: input.is_planned || false,
        is_completed: input.is_completed || false,
      },
    ])
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create transaction: ${error?.message || 'Unknown error'}`);
  }

  return data as Transaction;
}

/**
 * Update transaction
 */
export async function updateTransaction(input: UpdateTransactionInput): Promise<Transaction> {
  const { id, ...updates } = input;

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update transaction: ${error?.message || 'Unknown error'}`);
  }

  return data as Transaction;
}

/**
 * Delete transaction
 */
export async function deleteTransaction(transactionId: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', transactionId);

  if (error) {
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
}

/**
 * Mark planned transaction as completed
 */
export async function markTransactionCompleted(transactionId: string): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({ is_completed: true, is_planned: false })
    .eq('id', transactionId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to mark transaction as completed: ${error?.message || 'Unknown error'}`);
  }

  return data as Transaction;
}
