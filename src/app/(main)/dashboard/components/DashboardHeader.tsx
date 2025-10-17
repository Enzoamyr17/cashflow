'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionWithCategory } from '@/types';
import { calculateBalance, calculateTotalIncome, calculateTotalExpenses } from '@/lib/calculations';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';

interface DashboardHeaderProps {
  transactions: TransactionWithCategory[];
}

export function DashboardHeader({ transactions }: DashboardHeaderProps) {
  const { user } = useAuth();
  const { data: categories } = useCategories(user?.id);
  const transactionBalance = calculateBalance(transactions, categories || []);
  const totalIncome = calculateTotalIncome(transactions);
  const totalExpenses = calculateTotalExpenses(transactions, categories || []);
  const currentBalance = (user?.starting_balance || 0) + transactionBalance;

  const change = totalIncome - totalExpenses;

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 md:pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-semibold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-700'}`}>
            {formatCurrency(currentBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 hidden md:block">
            Starting balance + net transactions
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 md:pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 hidden md:block">
            {transactions.filter(t => t.type === 'income').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 md:pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-red-700">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 hidden md:block">
            {transactions.filter(t => t.type === 'expense').length} transactions
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 md:pb-2">
          <CardTitle className="text-sm font-medium">Change</CardTitle>
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-700'}`}>
            {formatCurrency(change)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 hidden md:block">
            Income - Expenses
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
