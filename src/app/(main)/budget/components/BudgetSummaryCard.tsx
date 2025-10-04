'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetSummary, CategoryBreakdown } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Calendar, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

interface BudgetSummaryCardProps {
  summary: BudgetSummary | undefined;
  breakdown: CategoryBreakdown[];
}

export function BudgetSummaryCard({ summary, breakdown }: BudgetSummaryCardProps) {
  if (!summary) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Frame</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.timeFrameDays}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.projectedExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">planned spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.actualExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">spent so far</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.remaining)}
            </div>
            <p className="text-xs text-muted-foreground">left to spend</p>
          </CardContent>
        </Card>
      </div>

      {breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {breakdown.map((cat) => (
                <div key={cat.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {cat.categoryColor && (
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.categoryColor }}
                      />
                    )}
                    <span className="font-medium">{cat.categoryName}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Planned: {formatCurrency(cat.planned)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Actual: {formatCurrency(cat.actual)}
                    </span>
                    <span className={`font-semibold ${cat.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Remaining: {formatCurrency(cat.remaining)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
