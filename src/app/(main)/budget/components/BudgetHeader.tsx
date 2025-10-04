'use client';

import { useBudgetSettings } from '@/hooks/useBudget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function BudgetHeader() {
  const { startDate, endDate, startingBudget, setStartDate, setEndDate, setStartingBudget } = useBudgetSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
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
            <Label htmlFor="startingBudget">Starting Budget (₱)</Label>
            <Input
              id="startingBudget"
              type="number"
              value={startingBudget}
              onChange={(e) => setStartingBudget(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
