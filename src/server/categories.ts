import { supabase } from '@/lib/supabaseClient';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types';

/**
 * Get all categories for a user
 */
export async function getCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data as Category[];
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data as Category;
}

/**
 * Create new category
 */
export async function createCategory(
  userId: string,
  input: CreateCategoryInput
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        user_id: userId,
        name: input.name,
        color: input.color || null,
        planned_amount: input.planned_amount || 0,
        is_budgeted: input.is_budgeted !== undefined ? input.is_budgeted : true,
      },
    ])
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create category: ${error?.message || 'Unknown error'}`);
  }

  return data as Category;
}

/**
 * Update category
 */
export async function updateCategory(input: UpdateCategoryInput): Promise<Category> {
  const { id, ...updates } = input;

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update category: ${error?.message || 'Unknown error'}`);
  }

  return data as Category;
}

/**
 * Delete category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', categoryId);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
}
