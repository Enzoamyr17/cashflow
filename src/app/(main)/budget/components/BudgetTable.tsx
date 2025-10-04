'use client';

import { useState } from 'react';
import { TransactionWithCategory, Category, PaymentMethod } from '@/types';
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

interface BudgetTableProps {
  transactions: TransactionWithCategory[];
  categories: Category[];
  userId: string;
}

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Gcash', 'Seabank', 'UBP', 'Other Bank', 'Others'];

export function BudgetTable({ transactions, categories, userId }: BudgetTableProps) {
  const [showAddRow, setShowAddRow] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [newTransaction, setNewTransaction] = useState({
    date: getTodayString(),
    category_id: '',
    amount: '',
    method: 'Cash' as PaymentMethod,
    notes: '',
  });

  const createMutation = useCreateTransaction(userId);
  const completeMutation = useMarkTransactionCompleted();
  const deleteMutation = useDeleteTransaction();

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.category_id) return;

    await createMutation.mutateAsync({
      date: newTransaction.date,
      type: 'expense',
      category_id: newTransaction.category_id,
      amount: parseFloat(newTransaction.amount),
      method: newTransaction.method,
      notes: newTransaction.notes || null,
      is_planned: true,
      is_completed: false,
    });

    // Reset form
    setNewTransaction({
      date: getTodayString(),
      category_id: '',
      amount: '',
      method: 'Cash',
      notes: '',
    });
    setShowAddRow(false);
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
        <h2 className="text-lg font-semibold">Planned Transactions</h2>
        <Button onClick={() => setShowAddRow(!showAddRow)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Planned Expense
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
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
              <TableCell>
                <CategorySelect
                  categories={categories}
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
                <span className="text-xs text-gray-500">Pending</span>
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
              <TableCell colSpan={7}>
                <EmptyState
                  title="No planned transactions"
                  description="Click 'Add Planned Expense' to start budgeting"
                />
              </TableCell>
            </TableRow>
          )}

          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell>{transaction.category_name || 'Uncategorized'}</TableCell>
              <TableCell className="font-semibold text-orange-600">
                {formatCurrency(Number(transaction.amount))}
              </TableCell>
              <TableCell>{transaction.method}</TableCell>
              <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                {transaction.notes || '-'}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleComplete(transaction.id)}
                  className="h-8"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
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
          ))}
        </TableBody>
      </Table>

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
