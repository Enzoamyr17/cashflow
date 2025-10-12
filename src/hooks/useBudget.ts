'use client';

import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BudgetSettings {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
}

/**
 * Zustand store for budget settings (persisted to localStorage)
 */
export const useBudgetSettings = create<BudgetSettings>()(
  persist(
    (set) => ({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      setStartDate: (date) => set({ startDate: date }),
      setEndDate: (date) => set({ endDate: date }),
    }),
    {
      name: 'cashflow_budget_settings',
    }
  )
);

/**
 * Hook to fetch budget summary
 */
export function useBudgetSummary(
  userId: string | undefined,
  startDate: string,
  endDate: string,
  userStartingBalance: number,
  userCreatedAt: string
) {
  return useQuery({
    queryKey: ['budgetSummary', userId, startDate, endDate, userStartingBalance, userCreatedAt],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const response = await fetch('/api/analytics/budget-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, startDate, endDate, userStartingBalance, userCreatedAt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch budget summary');
      }

      const data = await response.json();
      return data.summary;
    },
    enabled: !!userId && !!startDate && !!endDate,
  });
}

/**
 * Hook to fetch category breakdown (budgeted categories)
 */
export function useCategoryBreakdown(
  userId: string | undefined,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: ['categoryBreakdown', userId, startDate, endDate],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const response = await fetch('/api/analytics/category-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, startDate, endDate }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch category breakdown');
      }

      const data = await response.json();
      return data.breakdown;
    },
    enabled: !!userId && !!startDate && !!endDate,
  });
}

/**
 * Hook to fetch unbudgeted category breakdown
 */
export function useUnbudgetedCategoryBreakdown(
  userId: string | undefined,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: ['unbudgetedCategoryBreakdown', userId, startDate, endDate],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const response = await fetch('/api/analytics/unbudgeted-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, startDate, endDate }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch unbudgeted category breakdown');
      }

      const data = await response.json();
      return data.breakdown;
    },
    enabled: !!userId && !!startDate && !!endDate,
  });
}
