'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetSummary } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft } from 'lucide-react';

interface BudgetMetricsProps {
  summary: BudgetSummary;
}

export function BudgetMetrics({ summary }: BudgetMetricsProps) {
  // Actual balance uses only actual (completed) transactions
  const actualBalance = summary.startingBudget + summary.actualIncome - summary.actualExpenses;
  // Projected balance adds planned transactions to actual balance
  const projectedBalance = actualBalance + summary.projectedIncome - summary.projectedExpenses;
  // Calculate change for actual and projected
  const actualChange = summary.actualIncome - summary.actualExpenses;
  const projectedChange = summary.projectedIncome - summary.projectedExpenses;

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
            <div className={`text-2xl font-bold ${
              summary.startingBudget >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(summary.startingBudget)}
            </div>

          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Frame <span className="text-xs text-muted-foreground">(Months)</span></CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(summary.timeFrameDays / 30).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Column 2: Expenses */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.actualExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.projectedExpenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Column 3: Income */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.actualIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.projectedIncome)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Column 4: Change */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Change</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              actualChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(actualChange)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Change</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              projectedChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(projectedChange)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Column 5: Balances */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              actualBalance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(actualBalance)}
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(projectedBalance)}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
