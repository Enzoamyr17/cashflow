'use client';

import { TransactionWithCategory } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Trash2, Check } from 'lucide-react';

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionWithCategory;
  onDelete: () => void;
  onComplete?: () => void;
}

export function TransactionModal({
  open,
  onOpenChange,
  transaction,
  onDelete,
  onComplete,
}: TransactionModalProps) {
  const isPlanned = transaction.is_planned && !transaction.is_completed;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            View details of this transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Date:</span>
            <span className="col-span-2 text-sm">{formatDate(transaction.date)}</span>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Type:</span>
            <span className="col-span-2">
              <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                transaction.type === 'income' ? 'text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900' : 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900'
              }`}>
                {transaction.type}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Category:</span>
            <span className="col-span-2 text-sm">{transaction.categories?.name || 'Uncategorized'}</span>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Amount:</span>
            <span className={`col-span-2 text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-orange-600'}`}>
              {formatCurrency(Number(transaction.amount))}
            </span>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Method:</span>
            <span className="col-span-2 text-sm">{transaction.method}</span>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Notes:</span>
            <span className="col-span-2 text-sm">{transaction.notes || '-'}</span>
          </div>

          {isPlanned && (
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              <span className="col-span-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Planned
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-between gap-2">
          <Button
            variant="destructive"
            onClick={onDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <div className="flex gap-2">
            {isPlanned && onComplete && (
              <Button onClick={onComplete} className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Complete
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
