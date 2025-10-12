'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionType,
  TransactionWithCategory,
} from '@/types';
import { Category } from '@/types/category';
import { toast } from 'sonner';

/**
 * Hook to fetch transactions with optional filters
 */
export function useTransactions(
  userId: string | undefined,
  filters?: {
    type?: TransactionType;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    isPlanned?: boolean;
    isCompleted?: boolean;
  }
) {
  return useQuery({
    queryKey: ['transactions', userId, filters],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const response = await fetch('/api/transactions/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, filters }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch transactions');
      }

      const data = await response.json();
      return data.transactions as TransactionWithCategory[];
    },
    enabled: !!userId,
  });
}

/**
 * Hook to create a new transaction
 */
export function useCreateTransaction(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, input }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create transaction');
      }

      const data = await response.json();
      return data.transaction as TransactionWithCategory;
    },
    onMutate: async (newTransaction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      await queryClient.cancelQueries({ queryKey: ['categoryBreakdown'] });
      await queryClient.cancelQueries({ queryKey: ['budgetSummary'] });

      // Snapshot previous values
      const previousTransactions = queryClient.getQueriesData({ queryKey: ['transactions'] });
      const previousBreakdown = queryClient.getQueriesData({ queryKey: ['categoryBreakdown'] });
      const previousSummary = queryClient.getQueriesData({ queryKey: ['budgetSummary'] });

      // Get category info for the optimistic update
      const categories = queryClient.getQueryData(['categories', userId]) as Category[] | undefined;
      const category = categories?.find((cat: Category) => cat.id === newTransaction.category_id);

      // Optimistically add new transaction (with temporary ID and category info)
      queryClient.setQueriesData({ queryKey: ['transactions'] }, (old: TransactionWithCategory[] | undefined) => {
        if (!old) return old;
        return [...old, { 
          ...newTransaction, 
          id: 'temp-' + Date.now(), 
          user_id: userId, 
          created_at: new Date().toISOString(),
          category_name: category?.name || null,
          category_color: category?.color || null,
        } as TransactionWithCategory];
      });

      return { previousTransactions, previousBreakdown, previousSummary };
    },
    onSuccess: (data) => {
      // Update with real data from server
      queryClient.setQueriesData({ queryKey: ['transactions'] }, (old: TransactionWithCategory[] | undefined) => {
        if (!old) return [data];
        // Replace temporary transaction with real one
        return old.map((t: TransactionWithCategory) => t.id.toString().startsWith('temp-') ? data : t).filter((t: TransactionWithCategory, index: number, self: TransactionWithCategory[]) => 
          self.findIndex((item: TransactionWithCategory) => item.id === t.id) === index
        );
      });
      // Refetch breakdown and summary to reflect the new transaction
      queryClient.invalidateQueries({ queryKey: ['categoryBreakdown'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Transaction created successfully');
    },
    onError: (error: Error, newTransaction, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        context.previousTransactions.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousBreakdown) {
        context.previousBreakdown.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousSummary) {
        context.previousSummary.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(error.message || 'Failed to create transaction');
    },
  });
}

/**
 * Hook to update a transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTransactionInput) => {
      const response = await fetch('/api/transactions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update transaction');
      }

      const data = await response.json();
      return data.transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update transaction');
    },
  });
}

/**
 * Hook to delete a transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await fetch('/api/transactions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete transaction');
      }

      return;
    },
    onMutate: async (transactionId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      await queryClient.cancelQueries({ queryKey: ['categoryBreakdown'] });
      await queryClient.cancelQueries({ queryKey: ['budgetSummary'] });

      // Snapshot previous values
      const previousTransactions = queryClient.getQueriesData({ queryKey: ['transactions'] });
      const previousBreakdown = queryClient.getQueriesData({ queryKey: ['categoryBreakdown'] });
      const previousSummary = queryClient.getQueriesData({ queryKey: ['budgetSummary'] });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: ['transactions'] }, (old: TransactionWithCategory[] | undefined) => {
        if (!old) return old;
        return old.filter((t: TransactionWithCategory) => t.id !== transactionId);
      });

      return { previousTransactions, previousBreakdown, previousSummary };
    },
    onSuccess: () => {
      // Optimistic update already handled in onMutate
      // Refetch breakdown and summary to reflect the deleted transaction
      queryClient.invalidateQueries({ queryKey: ['categoryBreakdown'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: Error, transactionId, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        context.previousTransactions.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousBreakdown) {
        context.previousBreakdown.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousSummary) {
        context.previousSummary.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(error.message || 'Failed to delete transaction');
    },
  });
}

/**
 * Hook to mark a planned transaction as completed
 */
export function useMarkTransactionCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await fetch('/api/transactions/mark-completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark transaction as completed');
      }

      const data = await response.json();
      return data.transaction;
    },
    onMutate: async (transactionId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      await queryClient.cancelQueries({ queryKey: ['categoryBreakdown'] });
      await queryClient.cancelQueries({ queryKey: ['budgetSummary'] });

      // Snapshot previous values
      const previousTransactions = queryClient.getQueriesData({ queryKey: ['transactions'] });
      const previousBreakdown = queryClient.getQueriesData({ queryKey: ['categoryBreakdown'] });
      const previousSummary = queryClient.getQueriesData({ queryKey: ['budgetSummary'] });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: ['transactions'] }, (old: TransactionWithCategory[] | undefined) => {
        if (!old) return old;
        return old.map((t: TransactionWithCategory) => 
          t.id === transactionId ? { ...t, is_completed: true } : t
        );
      });

      return { previousTransactions, previousBreakdown, previousSummary };
    },
    onSuccess: () => {
      // Optimistic update already handled in onMutate
      // Refetch breakdown and summary to reflect the completion
      queryClient.invalidateQueries({ queryKey: ['categoryBreakdown'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Transaction marked as completed');
    },
    onError: (error: Error, transactionId, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        context.previousTransactions.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousBreakdown) {
        context.previousBreakdown.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousSummary) {
        context.previousSummary.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(error.message || 'Failed to mark transaction as completed');
    },
  });
}
