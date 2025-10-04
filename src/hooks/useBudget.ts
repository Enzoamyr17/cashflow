'use client';

import { useQuery } from '@tanstack/react-query';
import { getBudgetSummary, getCategoryBreakdownForBudget } from '@/server/analytics';
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
  startingBudget: number
) {
  return useQuery({
    queryKey: ['budgetSummary', userId, startDate, endDate, startingBudget],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return getBudgetSummary(userId, startDate, endDate, startingBudget);
    },
    enabled: !!userId && !!startDate && !!endDate,
  });
}

/**
 * Hook to fetch category breakdown
 */
export function useCategoryBreakdown(
  userId: string | undefined,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: ['categoryBreakdown', userId, startDate, endDate],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return getCategoryBreakdownForBudget(userId, startDate, endDate);
    },
    enabled: !!userId && !!startDate && !!endDate,
  });
}
