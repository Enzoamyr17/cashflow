'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/server/categories';
import { CreateCategoryInput, UpdateCategoryInput } from '@/types';
import { toast } from 'sonner';

/**
 * Hook to fetch all categories for a user
 */
export function useCategories(userId: string | undefined) {
  return useQuery({
    queryKey: ['categories', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return getCategories(userId);
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
    mutationFn: (input: CreateCategoryInput) => createCategory(userId, input),
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
    mutationFn: (input: UpdateCategoryInput) => updateCategory(input),
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
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });
}
