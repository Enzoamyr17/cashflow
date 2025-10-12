import { prisma } from '@/lib/prismaClient';
import { Prisma } from '@/generated/prisma';
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
  try {
    const where: Prisma.transactionsWhereInput = {
      user_id: userId,
    };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.categoryId) {
      where.category_id = filters.categoryId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    if (filters?.isPlanned !== undefined) {
      where.is_planned = filters.isPlanned;
    }

    if (filters?.isCompleted !== undefined) {
      where.is_completed = filters.isCompleted;
    }

    const data = await prisma.transactions.findMany({
      where,
      include: {
        categories: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Transform data to include category info and convert Decimal to number
    return data.map((t) => ({
      id: t.id,
      user_id: t.user_id,
      category_id: t.category_id,
      type: t.type,
      amount: Number(t.amount),
      method: t.method,
      notes: t.notes,
      date: t.date.toISOString(),
      is_planned: t.is_planned,
      is_completed: t.is_completed,
      created_at: t.created_at.toISOString(),
      category_name: t.categories?.name || null,
      category_color: t.categories?.color || null,
    })) as TransactionWithCategory[];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  try {
    const data = await prisma.transactions.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      user_id: data.user_id,
      category_id: data.category_id,
      type: data.type,
      amount: Number(data.amount),
      method: data.method,
      notes: data.notes,
      date: data.date.toISOString(),
      is_planned: data.is_planned,
      is_completed: data.is_completed,
      created_at: data.created_at.toISOString(),
    } as Transaction;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}

/**
 * Create new transaction
 */
export async function createTransaction(
  userId: string,
  input: CreateTransactionInput
): Promise<TransactionWithCategory> {
  try {
    const data = await prisma.transactions.create({
      data: {
        user_id: userId,
        category_id: input.category_id,
        type: input.type,
        amount: input.amount,
        method: input.method,
        notes: input.notes || null,
        date: new Date(input.date),
        is_planned: input.is_planned || false,
        is_completed: input.is_completed || false,
      },
      include: {
        categories: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    });

    return {
      id: data.id,
      user_id: data.user_id,
      category_id: data.category_id,
      type: data.type,
      amount: Number(data.amount),
      method: data.method,
      notes: data.notes,
      date: data.date.toISOString(),
      is_planned: data.is_planned,
      is_completed: data.is_completed,
      created_at: data.created_at.toISOString(),
      category_name: data.categories?.name || null,
      category_color: data.categories?.color || null,
    } as TransactionWithCategory;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to create transaction: ${message}`);
  }
}

/**
 * Update transaction
 */
export async function updateTransaction(input: UpdateTransactionInput): Promise<Transaction> {
  const { id, ...updates } = input;

  try {
    // Convert date if present
    const updateData: Prisma.transactionsUpdateInput = { ...updates };
    if (updateData.date) {
      updateData.date = new Date(updateData.date as string);
    }

    const data = await prisma.transactions.update({
      where: {
        id,
      },
      data: updateData,
    });

    return {
      id: data.id,
      user_id: data.user_id,
      category_id: data.category_id,
      type: data.type,
      amount: Number(data.amount),
      method: data.method,
      notes: data.notes,
      date: data.date.toISOString(),
      is_planned: data.is_planned,
      is_completed: data.is_completed,
      created_at: data.created_at.toISOString(),
    } as Transaction;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to update transaction: ${message}`);
  }
}

/**
 * Delete transaction
 */
export async function deleteTransaction(transactionId: string): Promise<void> {
  try {
    await prisma.transactions.delete({
      where: {
        id: transactionId,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to delete transaction: ${message}`);
  }
}

/**
 * Mark planned transaction as completed
 */
export async function markTransactionCompleted(transactionId: string): Promise<Transaction> {
  try {
    const data = await prisma.transactions.update({
      where: {
        id: transactionId,
      },
      data: {
        is_completed: true,
        is_planned: false,
      },
    });

    return {
      id: data.id,
      user_id: data.user_id,
      category_id: data.category_id,
      type: data.type,
      amount: Number(data.amount),
      method: data.method,
      notes: data.notes,
      date: data.date.toISOString(),
      is_planned: data.is_planned,
      is_completed: data.is_completed,
      created_at: data.created_at.toISOString(),
    } as Transaction;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to mark transaction as completed: ${message}`);
  }
}
