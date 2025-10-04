import { Transaction, CategoryBreakdown } from '@/types';

/**
 * Calculate total income from transactions
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Calculate total expenses from transactions
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Calculate balance (income - expenses)
 */
export function calculateBalance(transactions: Transaction[]): number {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  return income - expenses;
}

/**
 * Calculate projected expenses (planned expenses that haven't been completed yet)
 */
export function calculateProjectedExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense' && t.is_planned && !t.is_completed)
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Calculate actual expenses (non-planned or completed expenses)
 */
export function calculateActualExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense' && (!t.is_planned || t.is_completed))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Calculate projected income (planned income that hasn't been completed yet)
 */
export function calculateProjectedIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income' && t.is_planned && !t.is_completed)
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Calculate actual income (non-planned or completed income)
 */
export function calculateActualIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income' && (!t.is_planned || t.is_completed))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Calculate category breakdown for budgeting
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: Array<{ id: string; name: string; color: string | null; planned_amount?: number | null; is_budgeted?: boolean }>
): CategoryBreakdown[] {
  const breakdown: Record<string, CategoryBreakdown> = {};

  // Initialize breakdown for each category with planned amounts
  categories.forEach((cat) => {
    breakdown[cat.id] = {
      categoryId: cat.id,
      categoryName: cat.name,
      categoryColor: cat.color,
      planned: Number(cat.planned_amount || 0),
      actual: 0,
      remaining: 0,
    };
  });

  // Calculate actual spending for each category (income - expenses)
  transactions.forEach((t) => {
    if (!t.category_id || !breakdown[t.category_id]) return;

    if (t.type === 'income') {
      breakdown[t.category_id].actual += Number(t.amount);
    } else if (t.type === 'expense') {
      breakdown[t.category_id].actual -= Number(t.amount);
    }
  });

  // Calculate remaining for each category
  Object.values(breakdown).forEach((cat) => {
    cat.remaining = cat.planned + cat.actual;
  });

  // Return all categories without filtering
  return Object.values(breakdown);
}

/**
 * Calculate days between two dates
 */
export function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
