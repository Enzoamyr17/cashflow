'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  markTransactionCompleted,
} from '@/server/transactions';
import {
  Transaction,
  TransactionWithCategory,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionType,
} from '@/types';
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
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return getTransactions(userId, filters);
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
    mutationFn: (input: CreateTransactionInput) => createTransaction(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction created successfully');
    },
    onError: (error: Error) => {
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
    mutationFn: (input: UpdateTransactionInput) => updateTransaction(input),
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
    mutationFn: (transactionId: string) => deleteTransaction(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: Error) => {
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
    mutationFn: (transactionId: string) => markTransactionCompleted(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction marked as completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark transaction as completed');
    },
  });
}
