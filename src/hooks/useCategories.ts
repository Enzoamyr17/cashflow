'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCategoryInput, UpdateCategoryInput, Category } from '@/types';
import { toast } from 'sonner';

/**
 * Hook to fetch all categories for a user
 */
export function useCategories(userId: string | undefined) {
  return useQuery({
    queryKey: ['categories', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');

      const response = await fetch('/api/categories/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch categories');
      }

      const data = await response.json();
      return data.categories as Category[];
    },
    enabled: !!userId,
  });
}

/**
 * Hook to create a new category
 */
export function useCreateCategory(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const response = await fetch('/api/categories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, input }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }

      const data = await response.json();
      return data.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCategoryInput) => {
      const response = await fetch('/api/categories/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update category');
      }

      const data = await response.json();
      return data.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await fetch('/api/categories/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
}
