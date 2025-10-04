'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useBudgetSettings, useBudgetSummary, useCategoryBreakdown } from '@/hooks/useBudget';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BudgetHeader } from './components/BudgetHeader';
import { BudgetSummaryCard } from './components/BudgetSummaryCard';
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

  // Calculate total planned budget from budgeted categories only
  const totalPlannedBudget = useMemo(() => {
    return categories
      ?.filter(cat => cat.is_budgeted !== false)
      .reduce((sum, cat) => sum + (Number(cat.planned_amount) || 0), 0) || 0;
  }, [categories]);

  // Filter transactions to only show those from budgeted categories
  // Exclude uncategorized transactions (transactions without a category_id)
  const budgetedTransactions = useMemo(() => {
    if (!allTransactions || !categories) return [];
    const budgetedCategoryIds = new Set(
      categories.filter(cat => cat.is_budgeted !== false).map(cat => cat.id)
    );
    return allTransactions.filter(t => 
      t.category_id && budgetedCategoryIds.has(t.category_id)
    );
  }, [allTransactions, categories]);

  // Calculate total planned expenses from budgeted transactions
  const totalPlannedExpenses = useMemo(() => {
    if (!budgetedTransactions) return 0;
    return budgetedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [budgetedTransactions]);

  const { data: budgetSummary, isLoading: summaryLoading } = useBudgetSummary(
    user?.id,
    startDate,
    endDate,
    totalPlannedBudget
  );

  if (transactionsLoading || categoriesLoading || summaryLoading || breakdownLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <BudgetHeader 
        totalPlannedBudget={totalPlannedBudget}
        totalPlannedExpenses={totalPlannedExpenses}
      />
      <BudgetSummaryCard 
        summary={budgetSummary} 
        breakdown={categoryBreakdown || []} 
        categories={categories || []}
      />
      <BudgetTable
        transactions={budgetedTransactions}
        categories={categories || []}
        userId={user?.id || ''}
      />
    </div>
  );
}
