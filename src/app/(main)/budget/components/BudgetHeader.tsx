'use client';

import { useState } from 'react';
import { useBudgetSettings } from '@/hooks/useBudget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/formatters';

interface BudgetHeaderProps {
  startingBalance: number;
  timeFrameMonths: number;
}

export function BudgetHeader({ startingBalance, timeFrameMonths }: BudgetHeaderProps) {
  const { startDate, endDate, setStartDate, setEndDate } = useBudgetSettings();
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              onBlur={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              onBlur={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="time-frame">Time Frame <span className="text-xs text-muted-foreground">(Months)</span></Label>
            <Input
              id="time-frame"
              value={timeFrameMonths.toFixed(1)}
              readOnly
              className="bg-muted"
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
