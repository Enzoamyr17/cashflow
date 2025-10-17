import { getTransactions } from './transactions';
import { getCategories } from './categories';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateBalance,
  calculateProjectedExpenses,
  calculateActualExpenses,
  calculateProjectedIncome,
  calculateActualIncome,
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

  const allCategories = await getCategories(userId);

  return {
    totalIncome: calculateTotalIncome(transactions),
    totalExpenses: calculateTotalExpenses(transactions, allCategories),
    balance: calculateBalance(transactions, allCategories),
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
  userStartingBalance: number,
  userCreatedAt: string
): Promise<BudgetSummary> {
  // Fetch transactions before budget start date to adjust starting balance
  const transactionsBeforeStart = await getTransactions(userId, {
    endDate: startDate,
  });

  const allCategories = await getCategories(userId);

  // Filter to only completed transactions before start date
  const completedBeforeStart = transactionsBeforeStart.filter(t => !t.is_planned || t.is_completed);
  const incomeBeforeStart = calculateTotalIncome(completedBeforeStart);
  const expensesBeforeStart = calculateTotalExpenses(completedBeforeStart, allCategories);

  // Adjust starting balance with transactions before budget start date
  const adjustedStartingBalance = userStartingBalance + incomeBeforeStart - expensesBeforeStart;

  // Fetch transactions within budget period
  const allTransactions = await getTransactions(userId, {
    startDate,
    endDate,
  });


  // Include all transactions with categories (both budgeted and unbudgeted)
  // Only exclude uncategorized transactions (those without category_id)
  const categorizedTransactions = allTransactions.filter(t => t.category_id);

  const totalIncome = calculateTotalIncome(categorizedTransactions);
  const totalExpenses = calculateTotalExpenses(categorizedTransactions, allCategories);
  const projectedIncome = calculateProjectedIncome(categorizedTransactions);
  const actualIncome = calculateActualIncome(categorizedTransactions);
  const projectedExpenses = calculateProjectedExpenses(categorizedTransactions);
  const actualExpenses = calculateActualExpenses(categorizedTransactions, allCategories);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const timeFrameDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return {
    startDate,
    endDate,
    startingBudget: adjustedStartingBalance,
    timeFrameDays,
    totalIncome,
    totalExpenses,
    projectedIncome,
    actualIncome,
    projectedExpenses,
    actualExpenses,
    remaining: adjustedStartingBalance + totalIncome - totalExpenses,
  };
}

/**
 * Get category breakdown for budget (budgeted categories only)
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
 * Get category breakdown for unbudgeted categories
 */
export async function getUnbudgetedCategoryBreakdown(
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

  // Filter to only unbudgeted categories
  const unbudgetedCategories = allCategories.filter(cat => cat.is_budgeted === false);
  const unbudgetedCategoryIds = new Set(unbudgetedCategories.map(cat => cat.id));

  // Filter transactions to only those from unbudgeted categories
  const unbudgetedTransactions = allTransactions.filter(
    t => t.category_id && unbudgetedCategoryIds.has(t.category_id) && t.is_completed
  );

  return calculateCategoryBreakdown(unbudgetedTransactions, unbudgetedCategories);
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
