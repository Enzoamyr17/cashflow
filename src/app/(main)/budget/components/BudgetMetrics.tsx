'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetSummary, CategoryBreakdown, Category } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft } from 'lucide-react';

interface BudgetMetricsProps {
  summary: BudgetSummary;
  categoryBreakdown: CategoryBreakdown[];
  unbudgetedBreakdown: CategoryBreakdown[];
  categories: Category[];
  timeFrameMonths: number;
}

export function BudgetMetrics({ summary, categoryBreakdown, unbudgetedBreakdown, categories, timeFrameMonths }: BudgetMetricsProps) {
  // Calculate total budgeted expenses (sum of all Total Budgets)
  const budgetedExpenses = categoryBreakdown.reduce((total, cat) => {
    const category = categories.find(c => c.id === cat.categoryId);
    if (category?.is_monthly) {
      return total + (cat.planned * Math.floor(timeFrameMonths));
    }
    return total + cat.planned;
  }, 0);

  // Calculate unbudgeted expenses (actual expenses from unbudgeted categories)
  const unbudgetedExpenses = Math.abs(unbudgetedBreakdown.reduce((total, cat) => {
    return total + cat.actual;
  }, 0));

  // Calculate receivables (all planned incomes)
  const receivables = summary.projectedIncome;

  //actual balance uses only actual (completed) transactions
  const actualBalance = summary.startingBudget + summary.actualIncome - summary.actualExpenses;
  // Unbudgeted balance calculation (Starting Balance - Budgeted Expenses - Unbudgeted Expenses + Receivables)
  const unbudgetedBalance = summary.startingBudget - budgetedExpenses - unbudgetedExpenses + receivables + summary.actualIncome;
  // Calculate change for actual
  const actualChange = summary.actualIncome - summary.actualExpenses;

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {/* Column 1: Starting Balance */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Starting Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${
              summary.startingBudget >= 0 ? 'text-green-600' : 'text-red-700'
            }`}>
              {formatCurrency(summary.startingBudget)}
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Column 2: Expenses */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-700">
              {formatCurrency(summary.actualExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budgeted Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-700">
              {formatCurrency(budgetedExpenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Column 3: Income */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">
              {formatCurrency(summary.actualIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unbudgeted Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-700">
              {formatCurrency(unbudgetedExpenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Column 4: Change */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Change</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${
              actualChange >= 0 ? 'text-green-600' : 'text-red-700'
            }`}>
              {formatCurrency(actualChange)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receivables</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${
              receivables > 0 ? 'text-green-600' : 'text-red-700'
            }`}>
              {formatCurrency(receivables)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Column 5: Balances */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${
              actualBalance >= 0 ? 'text-green-600' : 'text-red-700'
            }`}>
              {formatCurrency(actualBalance)}
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unbudgeted Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${
              unbudgetedBalance >= 0 ? 'text-green-600' : 'text-red-700'
            }`}>
              {formatCurrency(unbudgetedBalance)}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
