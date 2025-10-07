'use client';

import { useState } from 'react';
import { useFilters } from '@/hooks/useFilters';
import { Category } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DashboardFiltersProps {
  categories: Category[];
}

export function DashboardFilters({ categories }: DashboardFiltersProps) {
  const { startDate, endDate, type, categoryId, setStartDate, setEndDate, setType, setCategoryId, clearFilters } = useFilters();
  const [localStartDate, setLocalStartDate] = useState(startDate || '');
  const [localEndDate, setLocalEndDate] = useState(endDate || '');

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
      <div className="flex-1 min-w-[200px]">
        <label className="mb-2 block text-sm font-medium">Start Date</label>
        <Input
          type="date"
          value={localStartDate}
          onChange={(e) => setLocalStartDate(e.target.value)}
          onBlur={(e) => setStartDate(e.target.value || undefined)}
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="mb-2 block text-sm font-medium">End Date</label>
        <Input
          type="date"
          value={localEndDate}
          onChange={(e) => setLocalEndDate(e.target.value)}
          onBlur={(e) => setEndDate(e.target.value || undefined)}
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="mb-2 block text-sm font-medium">Type</label>
        <Select value={type || 'all'} onValueChange={(value) => setType(value === 'all' ? undefined : value as 'income' | 'expense')}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="mb-2 block text-sm font-medium">Category</label>
        <Select value={categoryId || 'all'} onValueChange={(value) => setCategoryId(value === 'all' ? undefined : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={clearFilters} size="icon">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
