'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Transaction } from '@/types/transaction';

interface DashboardHeaderProps {
  transactions: Transaction[];
}

export function DashboardHeader({ transactions }: DashboardHeaderProps) {
  const { user } = useAuth();

  const totalIncome = (transactions?.filter(t => t.type === 'income') || []).reduce((acc, transaction) => {
    return acc + Number(transaction.amount);
  }, 0);
  
  const totalExpenses = (transactions?.filter(t => t.type === 'expense') || []).reduce((acc, transaction) => {
    return acc + Number(transaction.amount);
  }, 0);

  const totalUnbudgetedExpenses = (transactions?.filter(t => t.type === 'expense' && t.categories?.is_budgeted === false) || []).reduce((acc, transaction) => {
    return acc + Number(transaction.amount);
  }, 0);

  const currentBalance = Number(user?.starting_balance) + totalIncome - totalExpenses;

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
          <p className="text-xs text-muted-foreground mt-1">
            Unbudgeted: {formatCurrency(totalUnbudgetedExpenses)}
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
