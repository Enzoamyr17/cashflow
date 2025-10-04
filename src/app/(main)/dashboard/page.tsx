'use client';

import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useFilters } from '@/hooks/useFilters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardFilters } from './components/DashboardFilters';
import { TransactionTable } from './components/TransactionTable';

export default function DashboardPage() {
  const { user } = useAuth();
  const { startDate, endDate, type, categoryId } = useFilters();

  const { data: transactions, isLoading: transactionsLoading } = useTransactions(user?.id, {
    startDate,
    endDate,
    type,
    categoryId,
    isPlanned: false,
  });

  const { data: categories, isLoading: categoriesLoading } = useCategories(user?.id);

  if (transactionsLoading || categoriesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader transactions={transactions || []} />
      <DashboardFilters categories={categories || []} />
      <TransactionTable transactions={transactions || []} categories={categories || []} userId={user?.id || ''} />
    </div>
  );
}
