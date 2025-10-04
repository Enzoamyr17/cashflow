'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BudgetSummary, CategoryBreakdown, Category } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Calendar, TrendingDown, TrendingUp, Wallet, Edit2, Check, X, EyeOff, Plus } from 'lucide-react';
import { updateCategory } from '@/server/categories';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BudgetSummaryCardProps {
  summary: BudgetSummary | undefined;
  breakdown: CategoryBreakdown[];
  categories: Category[];
}

export function BudgetSummaryCard({ summary, breakdown, categories }: BudgetSummaryCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const queryClient = useQueryClient();

  // Get categories that are not currently budgeted
  const hiddenCategories = categories.filter(cat => cat.is_budgeted === false);

  const toggleBudgetedMutation = useMutation({
    mutationFn: ({ categoryId, isBudgeted }: { categoryId: string; isBudgeted: boolean }) =>
      updateCategory({ id: categoryId, is_budgeted: isBudgeted }),
    onMutate: async ({ categoryId, isBudgeted }) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      await queryClient.cancelQueries({ queryKey: ['categoryBreakdown'] });

      const previousCategories = queryClient.getQueriesData({ queryKey: ['categories'] });
      const previousBreakdown = queryClient.getQueriesData({ queryKey: ['categoryBreakdown'] });

      queryClient.setQueriesData({ queryKey: ['categories'] }, (old: Category[] | undefined) => {
        if (!old) return old;
        return old.map((cat: Category) => 
          cat.id === categoryId ? { ...cat, is_budgeted: isBudgeted } : cat
        );
      });

      return { previousCategories, previousBreakdown };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryBreakdown'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Category visibility updated');
    },
    onError: (error, variables, context) => {
      if (context?.previousCategories) {
        context.previousCategories.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousBreakdown) {
        context.previousBreakdown.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error('Failed to update category visibility');
      console.error('Error updating category:', error);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, plannedAmount }: { categoryId: string; plannedAmount: number }) =>
      updateCategory({ id: categoryId, planned_amount: plannedAmount }),
    onMutate: async ({ categoryId, plannedAmount }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      await queryClient.cancelQueries({ queryKey: ['categoryBreakdown'] });
      await queryClient.cancelQueries({ queryKey: ['budgetSummary'] });

      // Snapshot previous values
      const previousCategories = queryClient.getQueriesData({ queryKey: ['categories'] });
      const previousBreakdown = queryClient.getQueriesData({ queryKey: ['categoryBreakdown'] });
      const previousSummary = queryClient.getQueriesData({ queryKey: ['budgetSummary'] });

      // Optimistically update categories
      queryClient.setQueriesData({ queryKey: ['categories'] }, (old: Category[] | undefined) => {
        if (!old) return old;
        return old.map((cat: Category) => 
          cat.id === categoryId ? { ...cat, planned_amount: plannedAmount } : cat
        );
      });

      // Optimistically update breakdown
      queryClient.setQueriesData({ queryKey: ['categoryBreakdown'] }, (old: CategoryBreakdown[] | undefined) => {
        if (!old) return old;
        return old.map((cat: CategoryBreakdown) => 
          cat.categoryId === categoryId ? { ...cat, planned: plannedAmount, remaining: plannedAmount - cat.actual } : cat
        );
      });

      return { previousCategories, previousBreakdown, previousSummary };
    },
    onSuccess: () => {
      // Optimistic update already handled in onMutate
      // Refetch budget summary to reflect the new total
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Category budget updated');
      setEditingId(null);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        context.previousCategories.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousBreakdown) {
        context.previousBreakdown.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousSummary) {
        context.previousSummary.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error('Failed to update category budget');
      console.error('Error updating category:', error);
    },
  });

  const startEdit = (cat: CategoryBreakdown) => {
    setEditingId(cat.categoryId);
    setEditValue(cat.planned.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = (categoryId: string) => {
    const plannedAmount = parseFloat(editValue);
    if (isNaN(plannedAmount) || plannedAmount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    updateCategoryMutation.mutate({ categoryId, plannedAmount });
  };

  if (!summary) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Frame</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.timeFrameDays}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">in this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">in this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.remaining)}
            </div>
            <p className="text-xs text-muted-foreground">budget + income - expenses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Category Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Spent includes reimbursements (expenses - income per category)
              </p>
            </div>
            {hiddenCategories.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddCategory(!showAddCategory)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            )}
          </div>
        </CardHeader>
          <CardContent>
            {showAddCategory && hiddenCategories.length > 0 && (
              <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2">Select a category to add to budget:</p>
                <Select
                  onValueChange={(categoryId) => {
                    toggleBudgetedMutation.mutate({
                      categoryId,
                      isBudgeted: true
                    });
                    setShowAddCategory(false);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {hiddenCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center space-x-2">
                          {cat.color && (
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                          )}
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {breakdown.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No categories in budget.</p>
                <p className="text-sm mt-1">Click &quot;Add Category&quot; to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {breakdown.map((cat) => (
                  <TableRow key={cat.categoryId}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {cat.categoryColor && (
                          <div
                            className="h-3 w-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.categoryColor }}
                          />
                        )}
                        <span className="font-medium">{cat.categoryName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingId === cat.categoryId ? (
                        <div className="flex items-center space-x-1">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-28 h-8"
                            step="0.01"
                            min="0"
                          />
                          <button
                            onClick={() => saveEdit(cat.categoryId)}
                            className="text-green-600 hover:text-green-700 p-1"
                            disabled={updateCategoryMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{formatCurrency(cat.planned)}</span>
                          <button
                            onClick={() => startEdit(cat)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatCurrency(cat.actual)}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${cat.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(cat.remaining)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const category = categories.find(c => c.id === cat.categoryId);
                          if (category) {
                            toggleBudgetedMutation.mutate({
                              categoryId: cat.categoryId,
                              isBudgeted: false
                            });
                          }
                        }}
                        className="h-8 w-8"
                        title="Hide from budget"
                      >
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
