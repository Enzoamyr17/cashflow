'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetFrameWithCategories } from '@/types/budgetFrame';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Calendar, TrendingDown, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BudgetCardProps {
  budgetFrame: BudgetFrameWithCategories;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budgetFrame, onClick, onDelete }: BudgetCardProps) {
  const startDate = new Date(budgetFrame.start_date);
  const endDate = new Date(budgetFrame.end_date);
  const today = new Date();

  // Calculate if budget is active, upcoming, or past
  const isActive = today >= startDate && today <= endDate;
  const isUpcoming = today < startDate;
  const isPast = today > endDate;

  // Calculate status badge
  let statusBadge = null;
  if (isActive) {
    statusBadge = <Badge variant="default" className="bg-green-600">Active</Badge>;
  } else if (isUpcoming) {
    statusBadge = <Badge variant="secondary">Upcoming</Badge>;
  } else if (isPast) {
    statusBadge = <Badge variant="outline">Past</Badge>;
  }

  // Calculate total planned amount
  const totalPlanned = budgetFrame.budget_categories.reduce((sum, bc) => {
    const timeFrameMonths = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const amount = bc.is_monthly ? bc.planned_amount * Math.floor(timeFrameMonths) : bc.planned_amount;
    return sum + Number(amount);
  }, 0);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(budgetFrame.id);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{budgetFrame.name}</CardTitle>
              {statusBadge}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(budgetFrame.start_date)} - {formatDate(budgetFrame.end_date)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Starting Balance</p>
            <p className="text-lg font-semibold">{formatCurrency(Number(budgetFrame.starting_balance))}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Budgeted
            </p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(totalPlanned)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Categories</p>
            <p className="text-lg font-semibold">{budgetFrame.budget_categories.length}</p>
          </div>
        </div>

        {budgetFrame.budget_categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {budgetFrame.budget_categories.slice(0, 5).map((bc) => (
              <div
                key={bc.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-muted"
              >
                {bc.categories?.color && (
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: bc.categories.color }}
                  />
                )}
                <span>{bc.categories?.name}</span>
              </div>
            ))}
            {budgetFrame.budget_categories.length > 5 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{budgetFrame.budget_categories.length - 5} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
