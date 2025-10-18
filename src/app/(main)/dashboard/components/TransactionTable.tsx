'use client';

import { useState, useEffect } from 'react';
import { Transaction, Category, PaymentMethod, TransactionType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate, getTodayString } from '@/lib/formatters';
import { Trash2, Plus } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CategorySelect } from '@/components/common/CategorySelect';
import { CreateModal } from '@/components/common/CreateModal';
import { TransactionModal } from '@/components/common/TransactionModal';
import { toast } from 'sonner';

export interface NewTransactionForm {
  user_id: string;
  date: string;
  type: TransactionType;
  category_id: string;
  amount: string;
  method: PaymentMethod;
  notes: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  userId: string;
  onAddTransaction: (newTransaction: NewTransactionForm) => void;
  onDeleteTransaction: (deleteId: string) => void;
  onCategoryCreated?: (category: Category) => void;
}



const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Gcash', 'Seabank', 'UBP', 'Others'];

export function TransactionTable({ transactions, categories, userId, onAddTransaction, onDeleteTransaction, onCategoryCreated }: TransactionTableProps) {
  const [showAddRow, setShowAddRow] = useState(false);  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    user_id: userId,
    date: getTodayString(),
    type: 'expense' as TransactionType,
    category_id: '',
    amount: '',
    method: 'Cash' as PaymentMethod,
    notes: '',
  });


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAddClick = () => {
    if (isMobile) {
      setShowCreateModal(true);
    } else {
      setShowAddRow(!showAddRow);
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    if (isMobile) {
      setSelectedTransaction(transaction);
      setShowViewModal(true);
    }
  };

  const handleAddTransaction = async () => {
    onAddTransaction(newTransaction);
    setNewTransaction({
      user_id: userId,
      date: getTodayString(),
      type: 'expense' as TransactionType,
      category_id: '',
      amount: '',
      method: 'Cash' as PaymentMethod,
      notes: '',
    });
    setShowAddRow(false);
  };

  const handleDeleteTransaction = async () => {
    if (deleteId) {
      onDeleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  const handleModalSave = async (transaction: {
    user_id: string;
    date: string;
    type: TransactionType;
    category_id: string;
    amount: string;
    method: PaymentMethod;
    notes: string;
  }) => {
    if (!transaction.amount) {
      toast.error('Please enter an amount');
      return;
    }

    if (!transaction.category_id) {
      toast.error('Please select a category');
      return;
    }

    onAddTransaction(transaction);
    setShowCreateModal(false);
    
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <Button onClick={handleAddClick} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="hidden md:table-cell">Notes</TableHead>
            <TableHead className="hidden md:table-cell w-[50px]"></TableHead>
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
              <TableCell>
                <CategorySelect
                  categories={categories}
                  value={newTransaction.category_id}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, category_id: value })}
                  userId={userId}
                  placeholder="Select..."
                  className="h-8"
                  onCategoryCreated={onCategoryCreated}
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
                  title="No transactions yet"
                  description="Click 'Add Transaction' to get started"
                />
              </TableCell>
            </TableRow>
          )}

          {[...transactions].sort((a, b) => {
            const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateCompare !== 0) return dateCompare;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }).map((transaction) => (
            <TableRow
              key={transaction.id}
              onClick={() => handleTransactionClick(transaction)}
              className={isMobile ? 'cursor-pointer hover:bg-muted/50' : ''}
            >

              <TableCell>{formatDate(transaction.date)}</TableCell>

              <TableCell className="hidden md:table-cell">
                <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                  transaction.type === 'income' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {transaction.type}
                </span>
              </TableCell>

              <TableCell>
                {transaction.categories?.name || 'Uncategorized'}
              </TableCell>

              <TableCell className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
                {formatCurrency(Number(transaction.amount))}
              </TableCell>

              <TableCell>{transaction.method}</TableCell>

              <TableCell className="hidden md:table-cell text-sm text-gray-600 dark:text-gray-400">
                {transaction.notes || '-'}
              </TableCell>

              <TableCell className="hidden md:table-cell">
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

      <CreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        categories={categories}
        userId={userId}
        onSave={handleModalSave}
        onCategoryCreated={onCategoryCreated}
      />

      {selectedTransaction && (
        <TransactionModal
          open={showViewModal}
          onOpenChange={setShowViewModal}
          transaction={selectedTransaction}
          onDelete={() => {
            setDeleteId(selectedTransaction.id);
            setShowViewModal(false);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={handleDeleteTransaction}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
