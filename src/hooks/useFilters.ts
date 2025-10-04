'use client';

import { create } from 'zustand';
import { TransactionType } from '@/types';

interface FilterState {
  startDate: string | undefined;
  endDate: string | undefined;
  type: TransactionType | undefined;
  categoryId: string | undefined;
  setStartDate: (date: string | undefined) => void;
  setEndDate: (date: string | undefined) => void;
  setType: (type: TransactionType | undefined) => void;
  setCategoryId: (categoryId: string | undefined) => void;
  clearFilters: () => void;
}

export const useFilters = create<FilterState>((set) => ({
  startDate: undefined,
  endDate: undefined,
  type: undefined,
  categoryId: undefined,

  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setType: (type) => set({ type }),
  setCategoryId: (categoryId) => set({ categoryId }),

  clearFilters: () =>
    set({
      startDate: undefined,
      endDate: undefined,
      type: undefined,
      categoryId: undefined,
    }),
}));
