'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category } from '@/types/category';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getTodayString } from '@/lib/formatters';

interface BudgetCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  userId: string;
  onSave: (budgetFrame: {
    user_id: string;
    name: string;
    start_date: string;
    end_date: string;
    starting_balance: number;
    categories?: {
      category_id: string;
      planned_amount: number;
      is_monthly: boolean;
    }[];
  }) => Promise<void>;
  defaultStartingBalance?: number;
}

interface BudgetCategoryInput {
  category_id: string;
  planned_amount: string;
  is_monthly: boolean;
}

export function BudgetCreateModal({
  open,
  onOpenChange,
  categories,
  userId,
  onSave,
  defaultStartingBalance = 0,
}: BudgetCreateModalProps) {
  const today = getTodayString();
  const twoMonthsLater = new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(twoMonthsLater);
  const [startingBalance, setStartingBalance] = useState(defaultStartingBalance.toString());
  const [selectedCategories, setSelectedCategories] = useState<BudgetCategoryInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCategory = () => {
    if (categories.length === 0) {
      toast.error('No categories available');
      return;
    }

    // Find first category not already selected
    const availableCategory = categories.find(
      (cat) => !selectedCategories.some((sc) => sc.category_id === cat.id)
    );

    if (!availableCategory) {
      toast.error('All categories already added');
      return;
    }

    setSelectedCategories([
      ...selectedCategories,
      {
        category_id: availableCategory.id,
        planned_amount: '0',
        is_monthly: false,
      },
    ]);
  };

  const handleRemoveCategory = (index: number) => {
    setSelectedCategories(selectedCategories.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (index: number, field: keyof BudgetCategoryInput, value: string | boolean) => {
    const updated = [...selectedCategories];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedCategories(updated);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter a budget name');
      return;
    }
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    if (!endDate) {
      toast.error('Please select an end date');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        user_id: userId,
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        starting_balance: parseFloat(startingBalance) || 0,
        categories: selectedCategories
          .filter((sc) => sc.planned_amount && parseFloat(sc.planned_amount) > 0)
          .map((sc) => ({
            category_id: sc.category_id,
            planned_amount: parseFloat(sc.planned_amount),
            is_monthly: sc.is_monthly,
          })),
      });

      // Reset form
      setName('');
      setStartDate(today);
      setEndDate(twoMonthsLater);
      setStartingBalance(defaultStartingBalance.toString());
      setSelectedCategories([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCategories = categories.filter(
    (cat) => !selectedCategories.some((sc) => sc.category_id === cat.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>
            Create a budget frame with a specific date range and categories.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="budget-name">Budget Name</Label>
            <Input
              id="budget-name"
              placeholder="e.g., Q1 2025, January Budget"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="starting-balance">Starting Balance</Label>
            <Input
              id="starting-balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={startingBalance}
              onChange={(e) => setStartingBalance(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Budget Categories (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCategory}
                disabled={availableCategories.length === 0}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>

            {selectedCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories added yet. You can add them later.
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto border rounded-md p-3">
                {selectedCategories.map((sc, index) => {
                  const category = categories.find((c) => c.id === sc.category_id);
                  return (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <select
                        className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                        value={sc.category_id}
                        onChange={(e) => handleCategoryChange(index, 'category_id', e.target.value)}
                      >
                        <option value={sc.category_id}>
                          {category?.name || 'Select category'}
                        </option>
                        {availableCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>

                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        className="w-32"
                        value={sc.planned_amount}
                        onChange={(e) => handleCategoryChange(index, 'planned_amount', e.target.value)}
                      />

                      <div className="flex items-center gap-1">
                        <Checkbox
                          id={`monthly-${index}`}
                          checked={sc.is_monthly}
                          onCheckedChange={(checked: boolean) =>
                            handleCategoryChange(index, 'is_monthly', checked)
                          }
                        />
                        <Label htmlFor={`monthly-${index}`} className="text-xs whitespace-nowrap">
                          /month
                        </Label>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveCategory(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Budget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
