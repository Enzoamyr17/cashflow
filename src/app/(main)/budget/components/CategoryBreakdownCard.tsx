'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types/category';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/lib/formatters';
import { Edit2, Check, X, EyeOff, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AddCategoryToBudgetModal } from '@/components/budget/AddCategoryToBudgetModal';
interface CategoryBreakdownCardProps {
  budgetedCategories: Category[];
  unbudgetedCategories: Category[];
  categories: Category[];
  timeFrameMonths: string;
  transactions: Transaction[];
  budgetStartDate: string;
  budgetEndDate: string;
  onUpdateCategory?: (categoryId: string, plannedAmount: number, isMonthly: boolean) => Promise<void>;
  onRemoveCategory?: (categoryId: string) => Promise<void>;
  onAddCategory?: (categoryId: string, plannedAmount: number, isMonthly: boolean) => Promise<void>;
  budgetFrameId?: string;
}

export function CategoryBreakdownCard({
  budgetedCategories,
  unbudgetedCategories,
  categories,
  timeFrameMonths,
  transactions,
  budgetStartDate,
  budgetEndDate,
  onUpdateCategory,
  onRemoveCategory,
  onAddCategory,
  budgetFrameId
}: CategoryBreakdownCardProps) {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editIsMonthly, setEditIsMonthly] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Mutations
  const toggleBudgetedMutation = useMutation({
    mutationFn: async ({ categoryId, isBudgeted }: { categoryId: string; isBudgeted: boolean }) => {
      const response = await fetch('/api/categories/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId, is_budgeted: isBudgeted }),
      });
      if (!response.ok) throw new Error('Failed to update category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
      window.location.reload();
    },
    onError: () => {
      toast.error('Failed to update category');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, planned_amount, is_monthly }: { id: string; planned_amount: number; is_monthly: boolean }) => {
      const response = await fetch('/api/categories/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, planned_amount, is_monthly }),
      });
      if (!response.ok) throw new Error('Failed to update category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Budget updated successfully');
      window.location.reload();
    },
    onError: () => {
      toast.error('Failed to update budget');
    },
  });

  // Edit handlers
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditValue(String(cat.planned_amount || 0));
    setEditIsMonthly(cat.is_monthly || false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditIsMonthly(false);
  };

  const saveEdit = async (categoryId: string) => {
    const planned_amount = parseFloat(editValue);
    if (isNaN(planned_amount) || planned_amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // If we have a callback from parent (budget frame context), use it
    if (onUpdateCategory && budgetFrameId) {
      try {
        await onUpdateCategory(categoryId, planned_amount, editIsMonthly);
        setEditingId(null);
      } catch (error) {
        console.error('Error updating category:', error);
      }
    } else {
      // Otherwise use the old mutation (for backward compatibility)
      updateCategoryMutation.mutate({
        id: categoryId,
        planned_amount,
        is_monthly: editIsMonthly,
      });
      setEditingId(null);
    }
  };

  // Hidden categories (unbudgeted)
  const hiddenCategories = unbudgetedCategories;

  // Calculate actual spending for the budget frame period
  const calculateActualForMonth = (categoryId: string) => {
    const startDate = new Date(budgetStartDate);
    const endDate = new Date(budgetEndDate);

    // Filter transactions that belong to the budget frame period (exclude incomplete planned transactions)
    const transactionsList = Array.isArray(transactions) ? transactions : [];
    const categoryTransactions = transactionsList.filter(t => {
      if (t.categories?.id !== categoryId) return false;
      if (t.is_planned && !t.is_completed) return false;

      const txDate = new Date(t.date);
      return txDate >= startDate && txDate <= endDate;
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
    const transactionsList = Array.isArray(transactions) ? transactions : [];
    const categoryTransactions = transactionsList.filter(t => t.categories?.id === categoryId && !(t.is_planned && !t.is_completed));

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
  const calculateRemainingBudget = (cat: Category) => {
    const actualForMonth = calculateActualForMonth(cat.id);
    return (cat.planned_amount || 0) - actualForMonth;
  };

  const calculateTotalBudget = (cat: Category) => {
    let multiplier = parseFloat(timeFrameMonths);
    if (multiplier < 1) {
      multiplier = 1;
    }
    if (cat.is_monthly) {
      return (cat.planned_amount || 0) * Math.floor(multiplier);
    }
    return cat.planned_amount || 0;
  };

  const calculateTotalRemaining = (cat: Category) => {
    const totalBudget = calculateTotalBudget(cat);
    const totalActual = calculateTotalActual(cat.id);
    return totalBudget - totalActual;
  };

  // Calculate unbudgeted spending
  const unbudgetedBreakdown = unbudgetedCategories.map(cat => ({
    categoryId: cat.id,
    actual: calculateTotalActual(cat.id),
  }));

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
              {hiddenCategories.length > 0 && onAddCategory && budgetFrameId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Budget
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>

        {/* Budgeted Categories Table */}
        {budgetedCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No categories in budget.</p>
          </div>
        ) : (
          <>
            <h3 className="text-base opacity-50 mb-3">Budgeted Categories</h3>
            <Table>
              <TableHeader>
                <TableRow className="font-medium opacity-50">
                  <TableHead>Category</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="hidden lg:table-cell">Total Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {budgetedCategories
                .sort((a, b) => {
                  const catA = categories.find(c => c.id === a.id);
                  const catB = categories.find(c => c.id === b.id);

                  // Sort by monthly status first (monthly categories first)
                  if (catA?.is_monthly !== catB?.is_monthly) {
                    return catA?.is_monthly ? -1 : 1;
                  }

                  // Then by budget amount (descending)
                  if (a.planned_amount !== b.planned_amount) {
                    return (b.planned_amount || 0) - (a.planned_amount || 0);
                  }

                  // Finally by category name (alphabetical)
                  return a.name.localeCompare(b.name);
                })
                .map((cat) => {
                const category = categories.find(c => c.id === cat.id);
                const totalBudget = calculateTotalBudget(cat);
                const actualForMonth = calculateActualForMonth(cat.id);

                return (
                  <TableRow key={cat.id} className="">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {cat.color && (
                          <div
                            className="hidden lg:block h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                        )}
                        <span className="">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingId === cat.id ? (
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
                              onClick={() => saveEdit(cat.id)}
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
                              id={`is-monthly-${cat.id}`}
                              checked={editIsMonthly}
                              onCheckedChange={(checked: boolean) => setEditIsMonthly(checked)}
                            />
                            <Label htmlFor={`is-monthly-${cat.id}`} className="text-xs">
                              Monthly
                            </Label>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-start items-center">
                          <div className="flex items-center md:min-w-28">
                            <span className="">{formatCurrency(cat.planned_amount || 0)}</span>
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
                          {formatCurrency(calculateTotalRemaining(cat))}
                        </span>
                      ) : (
                        <span className={``}>
                          {formatCurrency(calculateRemainingBudget(cat))}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          const category = categories.find(c => c.id === cat.id);
                          if (category) {
                            // If we have a callback from parent (budget frame context), use it
                            if (onRemoveCategory && budgetFrameId) {
                              try {
                                await onRemoveCategory(cat.id);
                              } catch (error) {
                                console.error('Error removing category:', error);
                              }
                            } else {
                              // Otherwise use the old mutation
                              toggleBudgetedMutation.mutate({
                                categoryId: cat.id,
                                isBudgeted: false
                              });
                            }
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
        {hiddenCategories.length > 0 && transactions.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-base opacity-50 mb-3">Unbudgeted Categories</h3>
            <Table>
              <TableHeader>
                <TableRow className="font-medium opacity-50">
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
                      <TableRow key={cat.id} className="">
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

      {/* Add Category to Budget Modal */}
      {onAddCategory && budgetFrameId && (
        <AddCategoryToBudgetModal
          open={showAddCategory}
          onOpenChange={setShowAddCategory}
          availableCategories={hiddenCategories}
          onAdd={onAddCategory}
        />
      )}
    </Card>
  );
}
