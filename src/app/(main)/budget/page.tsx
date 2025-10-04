'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useBudgetSettings, useBudgetSummary, useCategoryBreakdown, useUnbudgetedCategoryBreakdown } from '@/hooks/useBudget';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BudgetHeader } from './components/BudgetHeader';
import { BudgetMetrics } from './components/BudgetMetrics';
import { CategoryBreakdownCard } from './components/CategoryBreakdownCard';
import { BudgetTable } from './components/BudgetTable';
import { useMemo } from 'react';

export default function BudgetPage() {
  const { user } = useAuth();
  const { startDate, endDate } = useBudgetSettings();

  const { data: allTransactions, isLoading: transactionsLoading } = useTransactions(user?.id, {
    startDate,
    endDate,
  });

  const { data: categories, isLoading: categoriesLoading } = useCategories(user?.id);

  const { data: categoryBreakdown, isLoading: breakdownLoading } = useCategoryBreakdown(
    user?.id,
    startDate,
    endDate
  );

  const { data: unbudgetedCategoryBreakdown, isLoading: unbudgetedBreakdownLoading } = useUnbudgetedCategoryBreakdown(
    user?.id,
    startDate,
    endDate
  );

  // Show all categorized transactions (both budgeted and unbudgeted)
  // Only exclude uncategorized transactions (those without a category_id)
  const categorizedTransactions = useMemo(() => {
    if (!allTransactions) return [];
    return allTransactions.filter(t => t.category_id);
  }, [allTransactions]);

  const { data: budgetSummary, isLoading: summaryLoading } = useBudgetSummary(
    user?.id,
    startDate,
    endDate,
    user?.starting_balance || 0,
    user?.created_at || new Date().toISOString()
  );

  if (transactionsLoading || categoriesLoading || summaryLoading || breakdownLoading || unbudgetedBreakdownLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <BudgetHeader
        startingBalance={user?.starting_balance || 0}
      />
      {budgetSummary && (
        <BudgetMetrics summary={budgetSummary} />
      )}
      <CategoryBreakdownCard
        breakdown={categoryBreakdown || []}
        unbudgetedBreakdown={unbudgetedCategoryBreakdown || []}
        categories={categories || []}
      />
      <BudgetTable
        transactions={categorizedTransactions}
        categories={categories || []}
        userId={user?.id || ''}
      />
    </div>
  );
}
