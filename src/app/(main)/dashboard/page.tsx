'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { DashboardHeader } from './components/DashboardHeader';
import { useEffect, useState } from 'react';
import { Transaction, TransactionType } from '@/types/transaction';
import { Category } from '@/types/category';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { TransactionTable, NewTransactionForm } from './components/TransactionTable';
import { toast } from 'sonner';

interface PaymentMethod{
  Cash: 'Cash';
  Gcash: 'Gcash';
  Seabank: 'Seabank';
  UBP: 'UBP';
  Others: 'Others';
}

interface DashboardHeaderProps {
  transactions: Transaction[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const userCreatedAt = user?.created_at?.split('T')[0] || '';

  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterStartDate, setfilterStartDate] = useState(userCreatedAt);
  const [filterEndDate, setfilterEndDate] = useState(today);
  const [filterType, setfilterType] = useState<('income' | 'expense' | 'all')>('all');
  const [filterCategoryId, setfilterCategoryId] = useState<string | undefined>(undefined);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const clearFilters = () => {
    setfilterStartDate(userCreatedAt);
    setfilterEndDate(today);
    setfilterType('all');
    setfilterCategoryId(undefined);
  };

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
          type: filterType === 'all' ? undefined : filterType as 'income' | 'expense',
          categoryId: filterCategoryId === 'all' ? undefined : filterCategoryId,
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
  }, [user, filterStartDate, filterEndDate, filterType, filterCategoryId ]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleAddTransaction = async (newTransaction: NewTransactionForm) => {
    try {
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        body: JSON.stringify({ newTransaction }),
      });
      const data = await response.json();
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

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories(prevCategories => [...prevCategories, newCategory]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="cursor-pointer md:cursor-default" onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}>
          <div className="flex items-center justify-between">
            <CardTitle>Filter Transactions</CardTitle>
            <div className="md:hidden">
              {isFiltersExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className={`${isFiltersExpanded ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col md:flex-row flex-wrap md:flex-nowrap justify-evenly items-center md:items-end gap-2 md:gap-4">
            <div className="w-full space-y-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filterStartDate}
                onChange={(e) => setfilterStartDate(e.target.value)}
                onBlur={(e) => setfilterStartDate(e.target.value || '')}
              />
            </div>

            <div className="w-full space-y-1">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filterEndDate}
                onChange={(e) => setfilterEndDate(e.target.value)}
                onBlur={(e) => setfilterEndDate(e.target.value || '')}
              />
            </div>

            <div className="flex flex-row md:flex-col justify-between items-center md:items-start space-y-1 w-full max-w-sm lg:w-auto">
              <Label htmlFor="filterType">Type</Label>
              <Select value={filterType} onValueChange={(value) => setfilterType(value as 'income' | 'expense' | 'all')}>
                <SelectTrigger id="filterType">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-row md:flex-col justify-between items-center md:items-start space-y-1 w-full max-w-sm lg:w-auto">
              <Label htmlFor="filterCategory">Category</Label>
              <Select key={categories.length} value={filterCategoryId || 'all'} onValueChange={(value) => setfilterCategoryId(value === 'all' ? undefined : value)}>
                <SelectTrigger id="filterCategory">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full flex justify-center">
              <Button variant="outline" onClick={clearFilters} className="w-full max-w-sm">
                <X className="h-4 w-4" />
                <p className="ml-2 block md:hidden lg:block">Clear Filters</p>
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>

      <DashboardHeader 
        transactions={transactions || []} />


      <TransactionTable 
        transactions={transactions || []}
        categories={categories || []}
        userId={user?.id || ''}
        onAddTransaction={handleAddTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        onCategoryCreated={handleCategoryCreated}
        />
    </div>
  );
}
