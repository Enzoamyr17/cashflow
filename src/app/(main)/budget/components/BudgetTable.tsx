'use client';

import { useState, useEffect } from 'react';
import { TransactionWithCategory, Category, PaymentMethod, TransactionType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTransaction, useMarkTransactionCompleted, useDeleteTransaction } from '@/hooks/useTransactions';
import { formatCurrency, formatDate, getTodayString } from '@/lib/formatters';
import { Trash2, Plus, Check } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CategorySelect } from '@/components/common/CategorySelect';
import { TransactionModal } from '@/components/common/TransactionModal';
import { toast } from 'sonner';

interface BudgetTableProps {
  transactions: TransactionWithCategory[];
  categories: Category[];
  userId: string;
}

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Gcash', 'Seabank', 'UBP', 'Other Bank', 'Others'];

export function BudgetTable({ transactions, categories, userId }: BudgetTableProps) {
  const [showAddRow, setShowAddRow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    date: getTodayString(),
    type: 'expense' as TransactionType,
    category_id: '',
    amount: '',
    method: 'Cash' as PaymentMethod,
    notes: '',
    is_planned: true,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter to only show budgeted categories in the dropdown
  const budgetedCategories = categories.filter(cat => cat.is_budgeted !== false);

  const createMutation = useCreateTransaction(userId);
  const completeMutation = useMarkTransactionCompleted();
  const deleteMutation = useDeleteTransaction();

  const handleAddClick = () => {
    if (isMobile) {
      setShowModal(true);
    } else {
      setShowAddRow(!showAddRow);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.amount) {
      toast.error('Please enter an amount');
      return;
    }

    if (!newTransaction.category_id) {
      toast.error('Please select a category');
      return;
    }

    await createMutation.mutateAsync({
      date: newTransaction.date,
      type: newTransaction.type,
      category_id: newTransaction.category_id,
      amount: parseFloat(newTransaction.amount),
      method: newTransaction.method,
      notes: newTransaction.notes || null,
      is_planned: newTransaction.is_planned,
      is_completed: !newTransaction.is_planned,
    });

    // Reset form
    setNewTransaction({
      date: getTodayString(),
      type: 'expense',
      category_id: '',
      amount: '',
      method: 'Cash',
      notes: '',
      is_planned: true,
    });
    setShowAddRow(false);
  };

  const handleModalSave = async (transaction: {
    date: string;
    type: TransactionType;
    category_id: string;
    amount: string;
    method: PaymentMethod;
    notes: string;
    is_planned?: boolean;
  }) => {
    if (!transaction.amount) {
      toast.error('Please enter an amount');
      return;
    }

    if (!transaction.category_id) {
      toast.error('Please select a category');
      return;
    }

    await createMutation.mutateAsync({
      date: transaction.date,
      type: transaction.type,
      category_id: transaction.category_id,
      amount: parseFloat(transaction.amount),
      method: transaction.method,
      notes: transaction.notes || null,
      is_planned: transaction.is_planned ?? true,
      is_completed: !(transaction.is_planned ?? true),
    });
  };

  const handleComplete = async (id: string) => {
    await completeMutation.mutateAsync(id);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Budget Transactions</h2>
        <Button onClick={handleAddClick} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Transaction
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {showAddRow && (
            <TableRow className="bg-blue-50 dark:bg-blue-950">
              <TableCell>
                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  className="h-8"
                />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Select
                  value={newTransaction.type}
                  onValueChange={(value: TransactionType) => setNewTransaction({ ...newTransaction, type: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <CategorySelect
                  categories={budgetedCategories}
                  value={newTransaction.category_id}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, category_id: value })}
                  userId={userId}
                  placeholder="Select..."
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Select
                  value={newTransaction.method}
                  onValueChange={(value: PaymentMethod) => setNewTransaction({ ...newTransaction, method: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Notes..."
                  value={newTransaction.notes}
                  onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Select
                  value={newTransaction.is_planned ? 'planned' : 'completed'}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, is_planned: value === 'planned' })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button onClick={handleAddTransaction} size="sm" className="h-8">
                  Save
                </Button>
              </TableCell>
            </TableRow>
          )}

          {transactions.length === 0 && !showAddRow && (
            <TableRow>
              <TableCell colSpan={8}>
                <EmptyState
                  title="No transactions"
                  description="Click 'Create Transaction' to start budgeting, or add transactions from the dashboard"
                />
              </TableCell>
            </TableRow>
          )}

          {[...transactions].sort((a, b) => {
            const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateCompare !== 0) return dateCompare;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }).map((transaction) => {
            const isCompleted = !transaction.is_planned || transaction.is_completed;

            return (
              <TableRow key={transaction.id} className={isCompleted ? 'opacity-60' : ''}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                    transaction.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {transaction.type}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">{transaction.category_name || 'Uncategorized'}</TableCell>
                <TableCell className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
                  <div className="size-2 inline-block mr-1 rounded-full md:hidden" style={{ backgroundColor: transaction.category_color || 'transparent' }}></div>
                  {transaction.type === 'income' ? '+' : ''}{formatCurrency(Number(transaction.amount))}
                </TableCell>
                <TableCell>{transaction.method}</TableCell>
                <TableCell className="max-w-40 md:max-w-none text-ellipsis overflow-hidden whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {transaction.notes || '-'}
                </TableCell>
                <TableCell>
                  {isCompleted ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Check className="h-3 w-3 mr-1" />
                      Completed
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleComplete(transaction.id)}
                      className="h-8"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(transaction.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TransactionModal
        open={showModal}
        onOpenChange={setShowModal}
        categories={budgetedCategories}
        userId={userId}
        onSave={handleModalSave}
        showPlannedToggle={true}
        filterBudgetedCategories={true}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Planned Transaction"
        description="Are you sure you want to delete this planned transaction?"
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
