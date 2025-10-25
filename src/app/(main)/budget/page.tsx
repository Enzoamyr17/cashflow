'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BudgetFrameWithCategories } from '@/types/budgetFrame';
import { Category } from '@/types/category';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BudgetCard } from '@/components/budget/BudgetCard';
import { BudgetCreateModal } from '@/components/budget/BudgetCreateModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function BudgetListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [budgetFrames, setBudgetFrames] = useState<BudgetFrameWithCategories[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchBudgetFrames = async () => {
    try {
      const response = await fetch('/api/budget-frames/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await response.json();
      setBudgetFrames(data.budgetFrames || []);
    } catch (error) {
      console.error('Error fetching budget frames:', error);
      toast.error('Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBudgetFrames();
      fetchCategories();
    }
  }, [user]);

  const handleCreateBudget = async (budgetData: {
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
  }) => {
    try {
      const response = await fetch('/api/budget-frames/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
      });

      if (!response.ok) {
        throw new Error('Failed to create budget');
      }

      const data = await response.json();
      toast.success('Budget created successfully');
      setBudgetFrames([data.budgetFrame, ...budgetFrames]);
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    }
  };

  const handleDeleteBudget = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch('/api/budget-frames/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ budgetFrameId: deleteId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      toast.success('Budget deleted successfully');
      setBudgetFrames(budgetFrames.filter((bf) => bf.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  const handleBudgetClick = (budgetId: string) => {
    router.push(`/budget/${budgetId}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your budget frames
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {budgetFrames.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first budget to start tracking your finances
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Budget
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgetFrames.map((budgetFrame) => (
            <BudgetCard
              key={budgetFrame.id}
              budgetFrame={budgetFrame}
              onClick={() => handleBudgetClick(budgetFrame.id)}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      <BudgetCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        categories={categories}
        userId={user?.id || ''}
        onSave={handleCreateBudget}
        defaultStartingBalance={Number(user?.starting_balance || 0)}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Budget"
        description="Are you sure you want to delete this budget? All associated transactions will remain but will no longer be linked to this budget."
        onConfirm={handleDeleteBudget}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
