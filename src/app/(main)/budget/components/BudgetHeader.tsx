'use client';

import { useBudgetSettings } from '@/hooks/useBudget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/formatters';

interface BudgetHeaderProps {
  totalPlannedBudget: number;
  totalPlannedExpenses: number;
}

export function BudgetHeader({ totalPlannedBudget, totalPlannedExpenses }: BudgetHeaderProps) {
  const { startDate, endDate, setStartDate, setEndDate } = useBudgetSettings();
  
  const currentBalance = totalPlannedBudget - totalPlannedExpenses;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="totalBudget">Total Planned Budget</Label>
            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
              <span className="font-medium">{formatCurrency(totalPlannedBudget)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sum of category budgets
            </p>
          </div>
          <div>
            <Label htmlFor="currentBalance">Current Balance</Label>
            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
              <span className={`font-medium ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(currentBalance)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Budget - Planned Expenses
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
