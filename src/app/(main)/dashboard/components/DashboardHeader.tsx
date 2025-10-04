'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionWithCategory } from '@/types';
import { calculateBalance, calculateTotalIncome, calculateTotalExpenses } from '@/lib/calculations';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface DashboardHeaderProps {
  transactions: TransactionWithCategory[];
}

export function DashboardHeader({ transactions }: DashboardHeaderProps) {
  const balance = calculateBalance(transactions);
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Current balance
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {transactions.filter(t => t.type === 'income').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {transactions.filter(t => t.type === 'expense').length} transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
