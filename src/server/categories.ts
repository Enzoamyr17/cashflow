import { prisma } from '@/lib/prismaClient';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types';

/**
 * Get all categories for a user
 */
export async function getCategories(userId: string): Promise<Category[]> {
  try {
    const data = await prisma.categories.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Convert Decimal fields to numbers
    return data.map((category) => ({
      id: category.id,
      user_id: category.user_id,
      name: category.name,
      color: category.color,
      created_at: category.created_at.toISOString(),
      planned_amount: category.planned_amount ? Number(category.planned_amount) : null,
      is_budgeted: category.is_budgeted,
      is_monthly: category.is_monthly,
    })) as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  try {
    const data = await prisma.categories.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      color: data.color,
      created_at: data.created_at.toISOString(),
      planned_amount: data.planned_amount ? Number(data.planned_amount) : null,
      is_budgeted: data.is_budgeted,
      is_monthly: data.is_monthly,
    } as Category;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

/**
 * Create new category
 */
export async function createCategory(
  userId: string,
  input: CreateCategoryInput
): Promise<Category> {
  try {
    const data = await prisma.categories.create({
      data: {
        user_id: userId,
        name: input.name,
        color: input.color || null,
        planned_amount: input.planned_amount || 0,
        is_budgeted: input.is_budgeted !== undefined ? input.is_budgeted : true,
      },
    });

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      color: data.color,
      created_at: data.created_at.toISOString(),
      planned_amount: data.planned_amount ? Number(data.planned_amount) : null,
      is_budgeted: data.is_budgeted,
      is_monthly: data.is_monthly,
    } as Category;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to create category: ${message}`);
  }
}

/**
 * Update category
 */
export async function updateCategory(input: UpdateCategoryInput): Promise<Category> {
  const { id, ...updates } = input;

  try {
    const data = await prisma.categories.update({
      where: {
        id,
      },
      data: updates,
    });

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      color: data.color,
      created_at: data.created_at.toISOString(),
      planned_amount: data.planned_amount ? Number(data.planned_amount) : null,
      is_budgeted: data.is_budgeted,
      is_monthly: data.is_monthly,
    } as Category;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to update category: ${message}`);
  }
}

/**
 * Delete category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    await prisma.categories.delete({
      where: {
        id: categoryId,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to delete category: ${message}`);
  }
}
