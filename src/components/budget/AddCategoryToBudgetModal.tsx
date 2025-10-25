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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface AddCategoryToBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableCategories: Category[];
  onAdd: (categoryId: string, plannedAmount: number, isMonthly: boolean) => Promise<void>;
}

export function AddCategoryToBudgetModal({
  open,
  onOpenChange,
  availableCategories,
  onAdd,
}: AddCategoryToBudgetModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategoryId) {
      toast.error('Please select a category');
      return;
    }
    if (!plannedAmount || parseFloat(plannedAmount) < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(selectedCategoryId, parseFloat(plannedAmount), isMonthly);

      // Reset form
      setSelectedCategoryId('');
      setPlannedAmount('');
      setIsMonthly(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category to Budget</DialogTitle>
          <DialogDescription>
            Select a category and set its planned amount for this budget.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No categories available
                  </div>
                ) : (
                  availableCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        {cat.color && (
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                        )}
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Planned Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={plannedAmount}
              onChange={(e) => setPlannedAmount(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-monthly"
              checked={isMonthly}
              onCheckedChange={(checked: boolean) => setIsMonthly(checked)}
            />
            <Label htmlFor="is-monthly" className="text-sm font-normal">
              Monthly budget (multiply by number of months)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
