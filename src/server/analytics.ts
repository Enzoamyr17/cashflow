import { getTransactions } from './transactions';
import { getCategories } from './categories';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  calculateProjectedExpenses,
  calculateActualExpenses,
  calculateCategoryBreakdown,
} from '@/lib/calculations';
import { BudgetSummary, CategoryBreakdown } from '@/types';

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}> {
  const transactions = await getTransactions(userId, {
    startDate,
    endDate,
    isPlanned: false,
  });

  return {
    totalIncome: calculateTotalIncome(transactions),
    totalExpenses: calculateTotalExpenses(transactions),
    balance: calculateBalance(transactions),
    transactionCount: transactions.length,
  };
}

/**
 * Get budget summary
 */
export async function getBudgetSummary(
  userId: string,
  startDate: string,
  endDate: string,
  startingBudget: number
): Promise<BudgetSummary> {
  const allTransactions = await getTransactions(userId, {
    startDate,
    endDate,
  });

  const projectedExpenses = calculateProjectedExpenses(allTransactions);
  const actualExpenses = calculateActualExpenses(allTransactions);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const timeFrameDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return {
    startDate,
    endDate,
    startingBudget,
    timeFrameDays,
    projectedExpenses,
    actualExpenses,
    remaining: startingBudget - actualExpenses,
  };
}

/**
 * Get category breakdown for budget
 */
export async function getCategoryBreakdownForBudget(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CategoryBreakdown[]> {
  const transactions = await getTransactions(userId, {
    type: 'expense',
    startDate,
    endDate,
  });

  const categories = await getCategories(userId);

  return calculateCategoryBreakdown(transactions, categories);
}

/**
 * Get income/expense trend data for charts
 */
export async function getTrendData(
  userId: string,
  startDate: string,
  endDate: string,
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<Array<{ date: string; income: number; expense: number; balance: number }>> {
  const transactions = await getTransactions(userId, {
    startDate,
    endDate,
    isPlanned: false,
  });

  // Group transactions by date
  const grouped: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((t) => {
    const date = t.date;
    if (!grouped[date]) {
      grouped[date] = { income: 0, expense: 0 };
    }

    if (t.type === 'income') {
      grouped[date].income += Number(t.amount);
    } else {
      grouped[date].expense += Number(t.amount);
    }
  });

  // Convert to array and calculate balance
  const result = Object.entries(grouped)
    .map(([date, { income, expense }]) => ({
      date,
      income,
      expense,
      balance: income - expense,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return result;
}
