'use client';

import { useBudgetSettings } from '@/hooks/useBudget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/formatters';

interface BudgetHeaderProps {
  startingBalance: number;
}

export function BudgetHeader({ startingBalance }: BudgetHeaderProps) {
  const { startDate, endDate, setStartDate, setEndDate } = useBudgetSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
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
            <Label htmlFor="starting-balance">Starting Balance</Label>
            <Input
              id="starting-balance"
              value={formatCurrency(startingBalance)}
              readOnly
              className="bg-muted"
            />

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
