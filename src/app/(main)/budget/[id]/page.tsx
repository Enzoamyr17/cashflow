'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Transaction, TransactionType, PaymentMethod } from '@/types/transaction';
import { BudgetFrameWithCategories, BudgetCategory } from '@/types/budgetFrame';
import { Category } from '@/types/category';
import { BudgetSummary, CategoryBreakdown } from '@/types/budget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CategoryBreakdownCard } from '../components/CategoryBreakdownCard';
import { BudgetTable } from '../components/BudgetTable';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { BudgetMetrics } from '../components/BudgetMetrics';

export default function BudgetDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const budgetFrameId = params.id as string;

  const [budgetFrame, setBudgetFrame] = useState<BudgetFrameWithCategories | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBudgetFrame = async () => {
    try {
      const response = await fetch('/api/budget-frames/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          budgetFrameId: budgetFrameId
        }),
      });

      const data = await response.json();
      if (data.budgetFrame) {
        setBudgetFrame(data.budgetFrame);
      } else {
        toast.error('Budget not found');
        router.push('/budget');
      }
    } catch (error) {
      console.error('Error fetching budget frame:', error);
      toast.error('Failed to load budget');
    }
  };

  const fetchTransactions = async () => {
    if (!budgetFrame) return;

    try {
      const requestBody = {
        userId: user?.id,
        filterStartDate: budgetFrame.start_date,
        filterEndDate: budgetFrame.end_date,
        budgetFrameId: budgetFrameId,
        isBudgetPage: true,
      };

      console.log('Fetching transactions with:', requestBody);

      const response = await fetch('/api/transactions/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Received transactions:', data);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const response = await fetch('/api/categories/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await response.json();
      setAllCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    if (user && budgetFrameId) {
      fetchBudgetFrame();
      fetchAllCategories();
    }
  }, [user, budgetFrameId]);

  useEffect(() => {
    if (budgetFrame) {
      fetchTransactions();
      setIsLoading(false);
    }
  }, [budgetFrame]);

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
            budget_frame_id: budgetFrameId,
            amount: parseFloat(newTransaction.amount),
            is_completed: newTransaction.is_completed ?? false,
          }
        }),
      });

      if(!response.ok){
        const errorData = await response.json();
        toast.error(errorData.error || 'Error adding transaction');
        return;
      }

      const data = await response.json();
      toast.success('Transaction added successfully');

      const newItem = {
        ...data.transaction,
        categories: allCategories.find(cat => cat.id === data.transaction.category_id) as {
          id: string;
          name: string;
          color: string;
          is_budgeted: boolean;
        },
      };

      // Ensure transactions is an array before spreading
      const currentTransactions = Array.isArray(transactions) ? transactions : [];
      setTransactions([newItem, ...currentTransactions]);
    } catch (error) {
      console.error('Error adding transaction:', error);
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
    setAllCategories(prevCategories => [...prevCategories, newCategory]);
  };

  const handleAddCategoryToBudget = async (categoryId: string, plannedAmount: number, isMonthly: boolean) => {
    try {
      const response = await fetch('/api/budget-categories/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget_frame_id: budgetFrameId,
          category_id: categoryId,
          planned_amount: plannedAmount,
          is_monthly: isMonthly,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add category to budget');
      }

      const data = await response.json();
      toast.success('Category added to budget');

      // Refresh budget frame to get updated budget_categories
      await fetchBudgetFrame();
    } catch (error) {
      console.error('Error adding category to budget:', error);
      toast.error('Failed to add category to budget');
    }
  };

  const handleRemoveCategoryFromBudget = async (budgetCategoryId: string) => {
    try {
      const response = await fetch('/api/budget-categories/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budgetCategoryId: budgetCategoryId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove category from budget');
      }

      toast.success('Category removed from budget');

      // Refresh budget frame to get updated budget_categories
      await fetchBudgetFrame();
    } catch (error) {
      console.error('Error removing category from budget:', error);
      toast.error('Failed to remove category from budget');
    }
  };

  const handleUpdateCategoryWrapper = async (categoryId: string, plannedAmount: number, isMonthly: boolean) => {
    // Find the budget_category ID from the category ID
    const budgetCategory = budgetFrame?.budget_categories.find(bc => bc.category_id === categoryId);
    if (!budgetCategory) {
      toast.error('Category not found in budget');
      return;
    }

    await handleUpdateBudgetCategory(budgetCategory.id, plannedAmount, isMonthly);
  };

  const handleRemoveCategoryWrapper = async (categoryId: string) => {
    // Find the budget_category ID from the category ID
    const budgetCategory = budgetFrame?.budget_categories.find(bc => bc.category_id === categoryId);
    if (!budgetCategory) {
      toast.error('Category not found in budget');
      return;
    }

    await handleRemoveCategoryFromBudget(budgetCategory.id);
  };

  const handleUpdateBudgetCategory = async (budgetCategoryId: string, plannedAmount: number, isMonthly: boolean) => {
    try {
      const response = await fetch('/api/budget-categories/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: budgetCategoryId,
          planned_amount: plannedAmount,
          is_monthly: isMonthly,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update budget category');
      }

      toast.success('Budget category updated');

      // Refresh budget frame to get updated budget_categories
      await fetchBudgetFrame();
    } catch (error) {
      console.error('Error updating budget category:', error);
      toast.error('Failed to update budget category');
    }
  };

  // Convert budget_categories to categories format for components
  const budgetedCategories = useMemo(() => {
    if (!budgetFrame) return [];

    return budgetFrame.budget_categories.map(bc => ({
      id: bc.category_id,
      budget_category_id: bc.id, // Store the budget_category ID for updates/deletes
      name: bc.categories?.name || '',
      color: bc.categories?.color || null,
      planned_amount: Number(bc.planned_amount),
      is_budgeted: true,
      is_monthly: bc.is_monthly,
      user_id: user?.id || '',
      created_at: bc.created_at,
    }));
  }, [budgetFrame, user?.id]);

  // Get categories that are not yet in this budget
  const availableCategories = useMemo(() => {
    if (!budgetFrame) return allCategories;

    const budgetCategoryIds = budgetFrame.budget_categories.map(bc => bc.category_id);
    return allCategories.filter(cat => !budgetCategoryIds.includes(cat.id));
  }, [allCategories, budgetFrame]);

  // Get unbudgeted categories (categories that exist but aren't in budget_categories)
  const unbudgetedCategories = useMemo(() => {
    if (!budgetFrame) return [];

    const budgetCategoryIds = budgetFrame.budget_categories.map(bc => bc.category_id);
    return allCategories.filter(cat => !budgetCategoryIds.includes(cat.id));
  }, [allCategories, budgetFrame]);

  // Calculate timeframe
  const timeFrameMonths = useMemo(() => {
    if (!budgetFrame) return 0;
    return parseFloat(((new Date(budgetFrame.end_date).getTime() - new Date(budgetFrame.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)).toFixed(1));
  }, [budgetFrame]);

  const timeFrameDays = useMemo(() => {
    if (!budgetFrame) return 0;
    return Math.ceil((new Date(budgetFrame.end_date).getTime() - new Date(budgetFrame.start_date).getTime()) / (1000 * 60 * 60 * 24));
  }, [budgetFrame]);

  // Calculate budget summary
  const summary: BudgetSummary = useMemo(() => {
    if (!budgetFrame) return {
      startDate: '',
      endDate: '',
      startingBudget: 0,
      timeFrameDays: 0,
      totalIncome: 0,
      totalExpenses: 0,
      projectedIncome: 0,
      actualIncome: 0,
      projectedExpenses: 0,
      actualExpenses: 0,
      remaining: 0,
    };

    // Ensure transactions is an array
    const transactionsList = Array.isArray(transactions) ? transactions : [];

    const plannedTransactions = transactionsList.filter(t => t.is_planned);
    const completedTransactions = transactionsList.filter(t => !t.is_planned);

    const projectedIncome = plannedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const projectedExpenses = plannedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const actualIncome = completedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const actualExpenses = completedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalIncome = projectedIncome + actualIncome;
    const totalExpenses = projectedExpenses + actualExpenses;

    return {
      startDate: budgetFrame.start_date,
      endDate: budgetFrame.end_date,
      startingBudget: Number(budgetFrame.starting_balance),
      timeFrameDays,
      totalIncome,
      totalExpenses,
      projectedIncome,
      actualIncome,
      projectedExpenses,
      actualExpenses,
      remaining: Number(budgetFrame.starting_balance) + totalIncome - totalExpenses,
    };
  }, [transactions, budgetFrame, timeFrameDays]);

  // Calculate category breakdown
  const categoryBreakdown: CategoryBreakdown[] = useMemo(() => {
    // Ensure transactions is an array
    const transactionsList = Array.isArray(transactions) ? transactions : [];

    return budgetedCategories.map(cat => {
      const categoryTransactions = transactionsList.filter(t => t.categories?.id === cat.id && !t.is_planned);

      const actual = categoryTransactions.reduce((sum, t) => {
        return sum + (t.type === 'expense' ? Number(t.amount) : -Number(t.amount));
      }, 0);

      let planned = cat.planned_amount || 0;
      if (cat.is_monthly) {
        planned = planned * Math.floor(timeFrameMonths);
      }

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryColor: cat.color,
        planned,
        actual,
        remaining: planned - actual,
      };
    });
  }, [budgetedCategories, transactions, timeFrameMonths]);

  // Calculate unbudgeted breakdown
  const unbudgetedBreakdown: CategoryBreakdown[] = useMemo(() => {
    // Ensure transactions is an array
    const transactionsList = Array.isArray(transactions) ? transactions : [];

    return unbudgetedCategories.map(cat => {
      const categoryTransactions = transactionsList.filter(t => t.categories?.id === cat.id && !t.is_planned);

      const actual = categoryTransactions.reduce((sum, t) => {
        return sum + (t.type === 'expense' ? Number(t.amount) : -Number(t.amount));
      }, 0);

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryColor: cat.color,
        planned: 0,
        actual,
        remaining: -actual, // No budget, so remaining is negative of actual
      };
    }).filter(breakdown => breakdown.actual !== 0); // Only show categories with transactions
  }, [unbudgetedCategories, transactions]);

  if (isLoading || !budgetFrame) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/budget')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{budgetFrame.name}</h1>
          <p className="text-muted-foreground">
            {formatDate(budgetFrame.start_date)} - {formatDate(budgetFrame.end_date)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Starting Balance</p>
              <p className="text-xl font-semibold">{formatCurrency(Number(budgetFrame.starting_balance))}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-xl font-semibold">{timeFrameDays} days</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-xl font-semibold">{budgetedCategories.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transactions</p>
              <p className="text-xl font-semibold">{transactions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <BudgetMetrics
        summary={summary}
        categoryBreakdown={categoryBreakdown}
        unbudgetedBreakdown={unbudgetedBreakdown}
        categories={budgetedCategories}
        timeFrameMonths={timeFrameMonths}
      />

      <CategoryBreakdownCard
        budgetedCategories={budgetedCategories}
        unbudgetedCategories={unbudgetedCategories}
        categories={budgetedCategories}
        timeFrameMonths={timeFrameMonths.toFixed(1)}
        transactions={transactions}
        onUpdateCategory={handleUpdateCategoryWrapper}
        onRemoveCategory={handleRemoveCategoryWrapper}
        onAddCategory={handleAddCategoryToBudget}
        budgetFrameId={budgetFrameId}
      />

      <BudgetTable
        transactions={transactions}
        categories={allCategories}
        userId={user?.id || ''}
        onAddTransaction={handleAddTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        onCompleteTransaction={handleCompleteTransaction}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
}
