'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { DashboardHeader } from './components/DashboardHeader';
import { useEffect, useState } from 'react';
import { Transaction, TransactionType } from '@/types/transaction';
import { Category } from '@/types/category';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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

      {/* Filters */}
      <div className="flex flex-wrap justify-evenly items-end gap-4 rounded-lg border bg-card p-4">
        <div className="flex flex-nowrap gap-4">
          <div className="w-1/2">
            <label className="mb-2 block text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={filterStartDate}
              onChange={(e) => setfilterStartDate(e.target.value)}
              onBlur={(e) => setfilterStartDate(e.target.value || '')}
            />
          </div>

          <div className="w-1/2">
            <label className="mb-2 block text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={filterEndDate}
              onChange={(e) => setfilterEndDate(e.target.value)}
              onBlur={(e) => setfilterEndDate(e.target.value || '')}
            />
          </div>
        </div>

        <div className="flex flex-nowrap gap-4">
          <div className="w-1/2">
            <label className="mb-2 block text-sm font-medium">Type</label>
            <Select value={filterType} onValueChange={(value) => setfilterType(value as 'income' | 'expense' | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-1/2">
            <label className="mb-2 block text-sm font-medium">Category</label>
            <Select key={categories.length} value={filterCategoryId || 'all'} onValueChange={(value) => setfilterCategoryId(value === 'all' ? undefined : value)}>
              <SelectTrigger>
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
        </div>

        <Button variant="outline" onClick={clearFilters} size="icon">
          <X className="h-4 w-4" />
        </Button>

      </div>

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
