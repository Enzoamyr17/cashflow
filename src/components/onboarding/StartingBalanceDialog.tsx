'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { updateUser } from '@/server/users';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function StartingBalanceDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    // Show dialog if user exists and has starting_balance of 0 (indicating new user)
    if (user && user.starting_balance === 0) {
      setOpen(true);
    }
  }, [user]);

  const updateBalanceMutation = useMutation({
    mutationFn: (newBalance: number) => {
      if (!user?.id) throw new Error('User not found');
      return updateUser(user.id, { starting_balance: newBalance });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Starting balance set successfully!');
      setOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to set starting balance');
      console.error('Error setting starting balance:', error);
    },
  });

  const handleSubmit = () => {
    const newBalance = parseFloat(balance);
    if (isNaN(newBalance)) {
      toast.error('Please enter a valid amount');
      return;
    }
    updateBalanceMutation.mutate(newBalance);
  };

  const handleSkip = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Cashflow! 👋</DialogTitle>
          <DialogDescription>
            Let&apos;s get started by setting your current account balance. This will be used as the baseline for all budget calculations.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="starting-balance">Current Account Balance</Label>
            <Input
              id="starting-balance"
              type="number"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              step="0.01"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Enter the amount of money you currently have in your account. You can always change this later in the budget page.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={updateBalanceMutation.isPending || !balance}
              className="flex-1"
            >
              {updateBalanceMutation.isPending ? 'Setting...' : 'Set Balance'}
            </Button>
            <Button
              onClick={handleSkip}
              variant="outline"
              disabled={updateBalanceMutation.isPending}
            >
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
