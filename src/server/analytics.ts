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

  const allCategories = await getCategories(userId);
  
  // Filter to only budgeted categories and their transactions
  const budgetedCategories = allCategories.filter(cat => cat.is_budgeted !== false);
  const budgetedCategoryIds = new Set(budgetedCategories.map(cat => cat.id));
  
  // Filter to only budgeted categories, excluding uncategorized transactions
  const budgetedTransactions = allTransactions.filter(
    t => t.category_id && budgetedCategoryIds.has(t.category_id)
  );

  const totalIncome = calculateTotalIncome(budgetedTransactions);
  const totalExpenses = calculateTotalExpenses(budgetedTransactions);
  const projectedExpenses = calculateProjectedExpenses(budgetedTransactions);
  const actualExpenses = calculateActualExpenses(budgetedTransactions);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const timeFrameDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return {
    startDate,
    endDate,
    startingBudget,
    timeFrameDays,
    totalIncome,
    totalExpenses,
    projectedExpenses,
    actualExpenses,
    remaining: startingBudget + totalIncome - totalExpenses,
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
  // Fetch all transactions (both expenses and income) to calculate net spending per category
  const allTransactions = await getTransactions(userId, {
    startDate,
    endDate,
  });

  const allCategories = await getCategories(userId);
  
  // Filter to only budgeted categories
  const budgetedCategories = allCategories.filter(cat => cat.is_budgeted !== false);
  const budgetedCategoryIds = new Set(budgetedCategories.map(cat => cat.id));
  
  // Filter transactions to only those from budgeted categories, excluding uncategorized
  const budgetedTransactions = allTransactions.filter(
    t => t.category_id && budgetedCategoryIds.has(t.category_id)
  );

  return calculateCategoryBreakdown(budgetedTransactions, budgetedCategories);
}

/**
 * Get income/expense trend data for charts
 */
export async function getTrendData(
  userId: string,
  startDate: string,
  endDate: string
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
