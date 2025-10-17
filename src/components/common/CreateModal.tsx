'use client';

import { useState } from 'react';
import { Category, PaymentMethod, TransactionType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelect } from '@/components/common/CategorySelect';
import { getTodayString } from '@/lib/formatters';

interface CreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  userId: string;
  onSave: (transaction: {
    user_id: string;
    date: string;
    type: TransactionType;
    category_id: string;
    amount: string;
    method: PaymentMethod;
    notes: string;
    is_planned?: boolean;
  }) => void;
  showPlannedToggle?: boolean;
  defaultType?: TransactionType;
  filterBudgetedCategories?: boolean;
}

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Gcash', 'Seabank', 'UBP', 'Others'];

export function CreateModal({
  open,
  onOpenChange,
  categories,
  userId,
  onSave,
  showPlannedToggle = false,
  defaultType = 'expense',
  filterBudgetedCategories = false,
}: CreateModalProps) {
  const [formData, setFormData] = useState({
    user_id: userId,
    date: getTodayString(),
    type: defaultType,
    category_id: '',
    amount: '',
    method: 'Cash' as PaymentMethod,
    notes: '',
    is_planned: true,
  });

  const filteredCategories = filterBudgetedCategories
    ? categories.filter(cat => cat.is_budgeted !== false)
    : categories;

  const handleSave = () => {
    onSave(formData);
    // Reset form
    setFormData({
      user_id: userId,
      date: getTodayString(),
      type: defaultType,
      category_id: '',
      amount: '',
      method: 'Cash',
      notes: '',
      is_planned: true,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Transaction</DialogTitle>
          <DialogDescription>
            Add a new transaction to your budget.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: TransactionType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <CategorySelect
              categories={filteredCategories}
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              userId={userId}
              placeholder="Select category..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select
              value={formData.method}
              onValueChange={(value: PaymentMethod) => setFormData({ ...formData, method: value })}
            >
              <SelectTrigger id="method">
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
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Add notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {showPlannedToggle && (
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.is_planned ? 'planned' : 'completed'}
                onValueChange={(value) => setFormData({ ...formData, is_planned: value === 'planned' })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Transaction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
