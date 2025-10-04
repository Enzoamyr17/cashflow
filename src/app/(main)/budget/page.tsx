'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useBudgetSettings, useBudgetSummary, useCategoryBreakdown } from '@/hooks/useBudget';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BudgetHeader } from './components/BudgetHeader';
import { BudgetSummaryCard } from './components/BudgetSummaryCard';
import { BudgetTable } from './components/BudgetTable';

export default function BudgetPage() {
  const { user } = useAuth();
  const { startDate, endDate, startingBudget } = useBudgetSettings();

  const { data: plannedTransactions, isLoading: plannedLoading } = useTransactions(user?.id, {
    startDate,
    endDate,
    isPlanned: true,
    isCompleted: false,
  });

  const { data: categories, isLoading: categoriesLoading } = useCategories(user?.id);

  const { data: budgetSummary, isLoading: summaryLoading } = useBudgetSummary(
    user?.id,
    startDate,
    endDate,
    startingBudget
  );

  const { data: categoryBreakdown, isLoading: breakdownLoading } = useCategoryBreakdown(
    user?.id,
    startDate,
    endDate
  );

  if (plannedLoading || categoriesLoading || summaryLoading || breakdownLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <BudgetHeader />
      <BudgetSummaryCard summary={budgetSummary} breakdown={categoryBreakdown || []} />
      <BudgetTable
        transactions={plannedTransactions || []}
        categories={categories || []}
        userId={user?.id || ''}
      />
    </div>
  );
}
