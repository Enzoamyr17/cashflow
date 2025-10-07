'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryBreakdown, Category, Transaction } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Edit2, Check, X, EyeOff, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { updateCategory } from '@/server/categories';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CategoryBreakdownCardProps {
  breakdown: CategoryBreakdown[];
  unbudgetedBreakdown: CategoryBreakdown[];
  categories: Category[];
  timeFrameMonths: number;
  transactions: Transaction[];
  startDate: string;
  endDate: string;
}

export function CategoryBreakdownCard({ breakdown, unbudgetedBreakdown, categories, timeFrameMonths, transactions, startDate, endDate }: CategoryBreakdownCardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editIsMonthly, setEditIsMonthly] = useState<boolean>(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Get categories that are not currently budgeted
  const hiddenCategories = categories.filter(cat => cat.is_budgeted === false);

  // Calculate actual spending for the month of the selected date
  const calculateActualForMonth = (categoryId: string) => {
    const current = new Date(currentDate);
    const currentMonth = current.getMonth();
    const currentYear = current.getFullYear();

    // Filter transactions that belong to the same month and year as currentDate (exclude planned transactions)
    const categoryTransactions = transactions.filter(t => {
      if (t.category_id !== categoryId) return false;
      if (t.is_planned) return false;

      const txDate = new Date(t.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    let actual = 0;
    categoryTransactions.forEach(t => {
      if (t.type === 'income') {
        actual -= Number(t.amount);
      } else if (t.type === 'expense') {
        actual += Number(t.amount);
      }
    });

    return actual;
  };

  // Calculate total actual spending across ALL transactions (for Total Remaining)
  const calculateTotalActual = (categoryId: string) => {
    const categoryTransactions = transactions.filter(t => t.category_id === categoryId && !t.is_planned);

    let actual = 0;
    categoryTransactions.forEach(t => {
      if (t.type === 'income') {
        actual -= Number(t.amount);
      } else if (t.type === 'expense') {
        actual += Number(t.amount);
      }
    });

    return actual;
  };

  // Calculate remaining budget for the selected month
  const calculateRemainingBudget = (cat: CategoryBreakdown) => {
    const actualForMonth = calculateActualForMonth(cat.categoryId);
    return cat.planned - actualForMonth;
  };

  const toggleBudgetedMutation = useMutation({
    mutationFn: ({ categoryId, isBudgeted }: { categoryId: string; isBudgeted: boolean }) =>
      updateCategory({ id: categoryId, is_budgeted: isBudgeted }),
    onMutate: async ({ categoryId, isBudgeted }) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      await queryClient.cancelQueries({ queryKey: ['categoryBreakdown'] });
      await queryClient.cancelQueries({ queryKey: ['unbudgetedCategoryBreakdown'] });

      const previousCategories = queryClient.getQueriesData({ queryKey: ['categories'] });
      const previousBreakdown = queryClient.getQueriesData({ queryKey: ['categoryBreakdown'] });
      const previousUnbudgeted = queryClient.getQueriesData({ queryKey: ['unbudgetedCategoryBreakdown'] });

      queryClient.setQueriesData({ queryKey: ['categories'] }, (old: Category[] | undefined) => {
        if (!old) return old;
        return old.map((cat: Category) =>
          cat.id === categoryId ? { ...cat, is_budgeted: isBudgeted } : cat
        );
      });

      return { previousCategories, previousBreakdown, previousUnbudgeted };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categoryBreakdown'] });
      queryClient.invalidateQueries({ queryKey: ['unbudgetedCategoryBreakdown'] });
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
      if (context?.previousUnbudgeted) {
        context.previousUnbudgeted.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error('Failed to update category visibility');
      console.error('Error updating category:', error);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, plannedAmount, isMonthly }: { categoryId: string; plannedAmount: number; isMonthly: boolean }) =>
      updateCategory({ id: categoryId, planned_amount: plannedAmount, is_monthly: isMonthly }),
    onMutate: async ({ categoryId, plannedAmount, isMonthly }) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      await queryClient.cancelQueries({ queryKey: ['categoryBreakdown'] });
      await queryClient.cancelQueries({ queryKey: ['budgetSummary'] });

      const previousCategories = queryClient.getQueriesData({ queryKey: ['categories'] });
      const previousBreakdown = queryClient.getQueriesData({ queryKey: ['categoryBreakdown'] });
      const previousSummary = queryClient.getQueriesData({ queryKey: ['budgetSummary'] });

      queryClient.setQueriesData({ queryKey: ['categories'] }, (old: Category[] | undefined) => {
        if (!old) return old;
        return old.map((cat: Category) =>
          cat.id === categoryId ? { ...cat, planned_amount: plannedAmount, is_monthly: isMonthly } : cat
        );
      });

      queryClient.setQueriesData({ queryKey: ['categoryBreakdown'] }, (old: CategoryBreakdown[] | undefined) => {
        if (!old) return old;
        return old.map((cat: CategoryBreakdown) =>
          cat.categoryId === categoryId ? { ...cat, planned: plannedAmount, remaining: plannedAmount - cat.actual } : cat
        );
      });

      return { previousCategories, previousBreakdown, previousSummary };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Category budget updated');
      setEditingId(null);
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
    const category = categories.find(c => c.id === cat.categoryId);
    setEditingId(cat.categoryId);
    setEditValue(cat.planned.toString());
    setEditIsMonthly(category?.is_monthly || false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditIsMonthly(false);
  };

  const saveEdit = (categoryId: string) => {
    const plannedAmount = parseFloat(editValue);
    if (isNaN(plannedAmount) || plannedAmount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    updateCategoryMutation.mutate({ categoryId, plannedAmount, isMonthly: editIsMonthly });
  };

  const calculateTotalBudget = (cat: CategoryBreakdown) => {
    const category = categories.find(c => c.id === cat.categoryId);
    if (category?.is_monthly) {
      return cat.planned * Math.floor(timeFrameMonths);
    }
    return cat.planned;
  };

  const calculateTotalRemaining = (cat: CategoryBreakdown) => {
    const totalBudget = calculateTotalBudget(cat);
    const totalActual = calculateTotalActual(cat.categoryId);
    return totalBudget - totalActual;
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Category Breakdown</CardTitle>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          {isExpanded && (
            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">

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
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
        {showAddCategory && hiddenCategories.length > 0 && (
          <div className="mb-4 p-4 border rounded-lg bg-muted/50">
            <p className="text-sm  mb-2">Select a category to add to budget:</p>
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

        {/* Budgeted Categories Table */}
        {breakdown.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No categories in budget.</p>
            <p className="text-sm mt-1">Click &quot;Add Category&quot; to get started.</p>
          </div>
        ) : (
          <>
            <h3 className="text-base font-semibold mb-3">Budgeted Categories</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="hidden lg:table-cell">Total Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {breakdown
                .sort((a, b) => {
                  const catA = categories.find(c => c.id === a.categoryId);
                  const catB = categories.find(c => c.id === b.categoryId);

                  // Sort by monthly status first (monthly categories first)
                  if (catA?.is_monthly !== catB?.is_monthly) {
                    return catA?.is_monthly ? -1 : 1;
                  }

                  // Then by budget amount (descending)
                  if (a.planned !== b.planned) {
                    return b.planned - a.planned;
                  }

                  // Finally by category name (alphabetical)
                  return a.categoryName.localeCompare(b.categoryName);
                })
                .map((cat) => {
                const category = categories.find(c => c.id === cat.categoryId);
                const totalBudget = calculateTotalBudget(cat);
                const actualForMonth = calculateActualForMonth(cat.categoryId);
                const remainingBudget = calculateRemainingBudget(cat);
                const totalRemaining = calculateTotalRemaining(cat);

                return (
                  <TableRow key={cat.categoryId}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {cat.categoryColor && (
                          <div
                            className="hidden lg:block h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.categoryColor }}
                          />
                        )}
                        <span className="">{cat.categoryName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingId === cat.categoryId ? (
                        <div className="flex flex-col space-y-2">
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
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`is-monthly-${cat.categoryId}`}
                              checked={editIsMonthly}
                              onCheckedChange={(checked: boolean) => setEditIsMonthly(checked)}
                            />
                            <Label htmlFor={`is-monthly-${cat.categoryId}`} className="text-xs">
                              Monthly
                            </Label>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-start items-center">
                          <div className="flex items-center md:min-w-28">
                            <span className="">{formatCurrency(cat.planned)}</span>
                            {category?.is_monthly && (
                              <span className="text-xs text-muted-foreground ml-1">/mo</span>
                            )}
                          </div>
                          <button
                            onClick={() => startEdit(cat)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 ml-1"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                        <span className="">
                          {formatCurrency(totalBudget)}
                        </span>
                    </TableCell>
                    <TableCell>
                      <span className={` ${actualForMonth < 0 ? 'text-green-600' : actualForMonth > 0 ? 'text-red-600' : ''}`}>
                        {formatCurrency(actualForMonth)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {category?.is_monthly ? (
                        <span className={``}>
                          {formatCurrency(totalRemaining)}
                        </span>
                      ) : (
                        <span className={``}>
                          {formatCurrency(remainingBudget)}
                        </span>
                      )}
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
                        title="Remove from budget"
                      >
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              </TableBody>
            </Table>
          </>
        )}

        {/* Unbudgeted Categories Table */}
        {hiddenCategories.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-base font-semibold mb-3">Unbudgeted Categories</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Flow</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hiddenCategories
                  .filter((cat) => {
                    const spending = unbudgetedBreakdown.find(b => b.categoryId === cat.id);
                    return spending && spending.actual !== 0;
                  })
                  .map((cat) => {
                    const spending = unbudgetedBreakdown.find(b => b.categoryId === cat.id);
                    return (
                      <TableRow key={cat.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {cat.color && (
                              <div
                                className="h-2 w-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                            )}
                            <span className="">{cat.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="">{formatCurrency(spending?.actual || 0)}</span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              toggleBudgetedMutation.mutate({
                                categoryId: cat.id,
                                isBudgeted: true
                              });
                            }}
                            className="h-8 w-8"
                            title="Add to budget"
                          >
                            <Plus className="h-4 w-4 text-gray-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}
        </CardContent>
      )}
    </Card>
  );
}
