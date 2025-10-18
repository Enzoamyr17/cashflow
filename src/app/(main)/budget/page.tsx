'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Transaction, TransactionType, PaymentMethod } from '@/types/transaction';
import { Category } from '@/types/category';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CategoryBreakdownCard } from './components/CategoryBreakdownCard';
import { BudgetTable } from './components/BudgetTable';
import { toast } from 'sonner';

export default function BudgetPage() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const userCreatedAt = user?.created_at?.split('T')[0] || '';
  const [filterStartDate, setfilterStartDate] = useState(userCreatedAt);
  const [filterEndDate, setfilterEndDate] = useState(today);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  
  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user?.id,
          filterStartDate: filterStartDate,
          filterEndDate: filterEndDate,
          type: undefined,
          categoryId: undefined,
          isBudgetPage: true,
         }),
      });

      const data = await response.json();
      setTransactions(data);
      console.log("Transactions fetched:", data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await response.json();
      setCategories(data);
      console.log("Categories fetched:", data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchCategories();
    }
  }, [user, filterStartDate, filterEndDate ]);

  const handleAddTransaction = async (newTransaction: {
    user_id: string;
    date: string;
    type: TransactionType;
    category_id: string;
    amount: string;
    method: PaymentMethod;
    notes: string;
    is_planned?: boolean;
    is_completed?: boolean;
  }) => {
    try {
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        body: JSON.stringify({
          newTransaction: {
            ...newTransaction,
            amount: parseFloat(newTransaction.amount),
            is_completed: newTransaction.is_completed ?? false,
          }
        }),
      });
      const data = await response.json();
      console.log(newTransaction);
      console.log(data);
      toast.success('Transaction added successfully');

      if(response.ok){
        const newItem = {
          ...data.transaction,
          categories: categories.find(cat => cat.id === data.transaction.category_id) as {
            id: string;
            name: string;
            color: string;
            is_budgeted: boolean;
          },
        };
        setTransactions([newItem, ...transactions]);
      }

    } catch (error) {
      toast.error('Error adding transaction');
    }
  };

  const handleDeleteTransaction = async (deleteId: string) => {
    if (deleteId) {
      try {
        const response = await fetch('/api/transactions/delete', {
          method: 'POST',
          body: JSON.stringify({ transactionId: deleteId }),
        });
        if(response.ok){
          toast.success('Transaction deleted successfully');
          setTransactions(transactions.filter(transaction => transaction.id !== deleteId));
        }
      } catch (error) {
        toast.error('Error deleting transaction');
      }
    }
  };

  const handleCompleteTransaction = async (transactionId: string) => {
    try {
      const response = await fetch('/api/transactions/mark-completed', {
        method: 'POST',
        body: JSON.stringify({ transactionId }),
      });

      if(response.ok){
        toast.success('Transaction completed successfully');
        setTransactions(transactions.map(t =>
          t.id === transactionId ? { ...t, is_completed: true, is_planned: false } : t
        ));
      }
    } catch (error) {
      toast.error('Error completing transaction');
    }
  };

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories(prevCategories => [...prevCategories, newCategory]);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const budgetedCategories = categories.filter(cat => cat.is_budgeted === true);
  const unbudgetedCategories = categories.filter(cat => cat.is_budgeted === false);

  return (
    <div className="space-y-6">
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
                value={filterStartDate}
                onChange={(e) => setfilterStartDate(e.target.value)}
                onBlur={(e) => setfilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filterEndDate}
                onChange={(e) => setfilterEndDate(e.target.value)}
                onBlur={(e) => setfilterEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time-frame">Time Frame <span className="text-xs text-muted-foreground">(Months)</span></Label>
              <Input
                id="time-frame"
                value={((new Date(filterEndDate).getTime() - new Date(filterStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30)).toFixed(1)}
                readOnly
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="starting-balance">Starting Balance</Label>
              <Input
                id="starting-balance"
                value={formatCurrency(user?.starting_balance || 0)}
                readOnly
                className="bg-muted"
              />

            </div>
          </div>
        </CardContent>
      </Card>

      <CategoryBreakdownCard
        budgetedCategories={budgetedCategories || []}
        unbudgetedCategories={unbudgetedCategories || []}
        categories={categories || []}
        timeFrameMonths={((new Date(filterEndDate).getTime() - new Date(filterStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30)).toFixed(1)}
        transactions={transactions || []}
      />

      <BudgetTable
        transactions={transactions || []}
        categories={categories || []}
        userId={user?.id || ''}
        onAddTransaction={handleAddTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        onCompleteTransaction={handleCompleteTransaction}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
}
