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
    // Only include negative values (expenses), skip positive values (income)
    return cat.actual < 0 ? total + cat.actual : total;
  }, 0));

  // Calculate receivables (all planned incomes)
  const receivables = summary.projectedIncome;

  //actual balance uses only actual (completed) transactions
  const actualBalance = summary.startingBudget + summary.actualIncome - summary.actualExpenses - unbudgetedExpenses;
  // Unbudgeted balance calculation (Starting Balance - Budgeted Expenses - Unbudgeted Expenses + Receivables)
  const unbudgetedBalance = summary.startingBudget - budgetedExpenses - unbudgetedExpenses + receivables + summary.actualIncome;
  // Calculate change for actual
  const actualChange = summary.actualIncome - summary.actualExpenses - unbudgetedExpenses;

  return (
    <div className="flex flex-wrap justify-evenly items-center gap-2">

      {/* Balance */}
      <Card className="order-1 md:order-1 w-1/3 lg:w-1/5 lg:max-w-1/2 flex-grow-1 whitespace-nowrap py-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <Wallet className="h-4 w-4 hidden lg:block text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-semibold ${
            actualBalance >= 0 ? 'text-green-600' : 'text-red-700'
          }`}>
            {formatCurrency(actualBalance)}
          </div>
        </CardContent>
      </Card>

      {/* Budgeted Expenses */}
      <Card className="order-2 md:order-5 w-1/3 lg:w-1/5 lg:max-w-1/2 flex-grow-1 whitespace-nowrap py-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budgeted Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 hidden lg:block text-red-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-red-700">
            {formatCurrency(budgetedExpenses)}
          </div>
        </CardContent>
      </Card>

      {/* Income */}
      <Card className="order-3 md:order-2 w-1/3 lg:w-1/5 lg:max-w-1/2 flex-grow-1 whitespace-nowrap py-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income</CardTitle>
          <TrendingUp className="h-4 w-4 hidden lg:block text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-green-600">
            {formatCurrency(summary.actualIncome)}
          </div>
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card className="order-4 md:order-6 w-1/3 lg:w-1/5 lg:max-w-1/2 flex-grow-1 whitespace-nowrap py-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 hidden lg:block text-red-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-red-700">
            {formatCurrency(summary.actualExpenses + unbudgetedExpenses)}
          </div>
          <p className="text-xs text-muted-foreground h-0 ">
            {formatCurrency(unbudgetedExpenses)} unbudgeted expenses
          </p>
        </CardContent>
      </Card>

      {/* Receivables */}
      <Card className="order-5 md:order-3 w-1/3 lg:w-1/5 lg:max-w-1/2 flex-grow-1 whitespace-nowrap py-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receivables</CardTitle>
          <TrendingUp className="h-4 w-4 hidden lg:block text-green-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-semibold ${
            receivables > 0 ? 'text-green-600' : 'text-red-700'
          }`}>
            {formatCurrency(receivables)}
          </div>
        </CardContent>
      </Card>

      {/* Change */}
      <Card className="order-6 md:order-7 w-1/3 lg:w-1/5 lg:max-w-1/2 flex-grow-1 whitespace-nowrap py-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Change</CardTitle>
          <ArrowRightLeft className="h-4 w-4 hidden lg:block text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-semibold ${
            actualChange >= 0 ? 'text-green-600' : 'text-red-700'
          }`}>
            {formatCurrency(actualChange)}
          </div>
        </CardContent>
      </Card>

      {/* Unbudgeted Balance */}
      <Card className="order-7 md:order-4 w-1/3 lg:w-1/5 lg:max-w-1/2 flex-grow-1 whitespace-nowrap py-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unbudgeted Balance</CardTitle>
          <Wallet className="h-4 w-4 hidden lg:block text-muted-foreground" />
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
  );
}
