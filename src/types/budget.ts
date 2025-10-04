export interface Budget {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  startingBudget: number;
}

export interface BudgetSummary extends Budget {
  timeFrameDays: number;
  totalIncome: number;
  totalExpenses: number;
  projectedIncome: number;
  actualIncome: number;
  projectedExpenses: number;
  actualExpenses: number;
  remaining: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string | null;
  planned: number;
  actual: number;
  remaining: number;
}
