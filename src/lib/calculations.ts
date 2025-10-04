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
 * Calculate projected expenses from all expense transactions in the timeframe
 */
export function calculateProjectedExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

/**
 * Calculate actual expenses from all expense transactions
 */
export function calculateActualExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
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

  // Calculate actual spending for each category (expenses - income for reimbursements)
  transactions.forEach((t) => {
    if (!t.category_id || !breakdown[t.category_id]) return;
    
    if (t.type === 'expense') {
      breakdown[t.category_id].actual += Number(t.amount);
    } else if (t.type === 'income') {
      // Income in a category acts as a reimbursement/offset
      breakdown[t.category_id].actual -= Number(t.amount);
    }
  });

  // Calculate remaining for each category
  Object.values(breakdown).forEach((cat) => {
    cat.remaining = cat.planned - cat.actual;
  });

  // Only show categories that are marked as budgeted
  return Object.values(breakdown).filter(cat => {
    const category = categories.find(c => c.id === cat.categoryId);
    return category?.is_budgeted !== false;
  });
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
