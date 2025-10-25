# Budget Category Due Date & Pay Button Feature

## Overview
Add due date tracking and payment functionality to the budget category breakdown table, allowing users to:
1. See when each budgeted category is due for payment
2. Mark categories as "paid" with actual amounts via a Pay modal
3. Store completed payments as transactions with `is_completed: true`

---

## Database Changes

### 1. Add `due_date` to `budget_categories` table

**File**: `/prisma/schema.prisma`

Add the `due_date` field to the `budget_categories` model:

```prisma
model budget_categories {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  budget_frame_id String        @db.Uuid
  category_id     String        @db.Uuid
  planned_amount  Decimal       @default(0) @db.Decimal(10, 2)
  is_monthly      Boolean       @default(false)
  due_date        DateTime?     @db.Date  // NEW FIELD
  created_at      DateTime      @default(now()) @db.Timestamptz(6)
  budget_frames   budget_frames @relation(fields: [budget_frame_id], references: [id], onDelete: Cascade, onUpdate: NoAction)
  categories      categories    @relation(fields: [category_id], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@unique([budget_frame_id, category_id], map: "unique_budget_category")
  @@index([budget_frame_id], map: "idx_budget_categories_budget_frame_id")
  @@index([category_id], map: "idx_budget_categories_category_id")
}
```

**Run Migration**:
```bash
npx prisma db push
```

---

## Type Updates

### 2. Update TypeScript types

**File**: `/src/types/budgetFrame.ts`

Update interfaces to include `due_date`:

```typescript
export interface BudgetCategory {
  id: string;
  budget_frame_id: string;
  category_id: string;
  planned_amount: number;
  is_monthly: boolean;
  due_date?: string | null;  // NEW FIELD
  created_at: string;
  categories?: {
    id: string;
    name: string;
    color: string | null;
  };
}

export interface AddCategoryToBudgetInput {
  budget_frame_id: string;
  category_id: string;
  planned_amount: number;
  is_monthly: boolean;
  due_date?: string | null;  // NEW FIELD
}

export interface UpdateBudgetCategoryInput {
  id: string;
  planned_amount?: number;
  is_monthly?: boolean;
  due_date?: string | null;  // NEW FIELD
}
```

---

## Backend (API Routes)

### 3. Update budget-categories API routes

#### **File**: `/src/app/api/budget-categories/add/route.ts`

Update to accept and store `due_date`:

```typescript
export async function POST(request: NextRequest) {
  try {
    const { budget_frame_id, category_id, planned_amount, is_monthly, due_date } = await request.json();

    // Validation...

    const budgetCategory = await prisma.budget_categories.create({
      data: {
        budget_frame_id,
        category_id,
        planned_amount,
        is_monthly: is_monthly ?? false,
        due_date: due_date ? new Date(due_date) : null,  // NEW
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({ budgetCategory }, { status: 201 });
  } catch (error) {
    console.error('Error adding category to budget:', error);
    return NextResponse.json(
      { error: 'Failed to add category to budget' },
      { status: 500 }
    );
  }
}
```

#### **File**: `/src/app/api/budget-categories/update/route.ts`

Update to accept and update `due_date`:

```typescript
export async function POST(request: NextRequest) {
  try {
    const { id, planned_amount, is_monthly, due_date } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Budget category ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (planned_amount !== undefined) updateData.planned_amount = planned_amount;
    if (is_monthly !== undefined) updateData.is_monthly = is_monthly;
    if (due_date !== undefined) {  // NEW
      updateData.due_date = due_date ? new Date(due_date) : null;
    }

    const budgetCategory = await prisma.budget_categories.update({
      where: { id },
      data: updateData,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({ budgetCategory });
  } catch (error) {
    console.error('Error updating budget category:', error);
    return NextResponse.json(
      { error: 'Failed to update budget category' },
      { status: 500 }
    );
  }
}
```

---

## Frontend Components

### 4. Create `PayCategoryModal` component

**File**: `/src/components/budget/PayCategoryModal.tsx` (NEW FILE)

```typescript
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PaymentMethod } from '@/types/transaction';

interface PayCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  categoryId: string;
  plannedAmount: number;
  budgetFrameId: string;
  onPaymentComplete: () => void;
}

export function PayCategoryModal({
  open,
  onOpenChange,
  categoryName,
  categoryId,
  plannedAmount,
  budgetFrameId,
  onPaymentComplete,
}: PayCategoryModalProps) {
  const [amount, setAmount] = useState(plannedAmount.toString());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newTransaction: {
            category_id: categoryId,
            budget_frame_id: budgetFrameId,
            type: 'expense',
            amount: parseFloat(amount),
            date: date,
            method: method,
            notes: notes || `Payment for ${categoryName}`,
            is_planned: false,
            is_completed: true,  // Mark as completed payment
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to record payment');
        return;
      }

      toast.success('Payment recorded successfully');

      // Reset form
      setAmount(plannedAmount.toString());
      setDate(new Date().toISOString().split('T')[0]);
      setMethod('Cash');
      setNotes('');

      onPaymentComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for <strong>{categoryName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="planned-amount" className="text-sm text-muted-foreground">
              Planned Amount
            </Label>
            <div className="text-lg font-semibold">
              ₱{plannedAmount.toFixed(2)}
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Actual Amount Paid *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="date">Payment Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="method">Payment Method *</Label>
            <Select value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Gcash">Gcash</SelectItem>
                <SelectItem value="Seabank">Seabank</SelectItem>
                <SelectItem value="UBP">UBP</SelectItem>
                <SelectItem value="Other_Bank">Other Bank</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              type="text"
              placeholder="Add payment notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 5. Update `CategoryBreakdownCard` component

**File**: `/src/app/(main)/budget/components/CategoryBreakdownCard.tsx`

**Changes needed**:

1. **Add state for Pay modal**:
```typescript
const [showPayModal, setShowPayModal] = useState(false);
const [selectedPayCategory, setSelectedPayCategory] = useState<{
  id: string;
  name: string;
  plannedAmount: number;
} | null>(null);
```

2. **Update props interface**:
```typescript
interface CategoryBreakdownCardProps {
  budgetedCategories: Category[];
  unbudgetedCategories: Category[];
  categories: Category[];
  timeFrameMonths: string;
  transactions: Transaction[];
  onUpdateCategory?: (categoryId: string, plannedAmount: number, isMonthly: boolean, dueDate?: string | null) => Promise<void>;
  onRemoveCategory?: (categoryId: string) => Promise<void>;
  onAddCategory?: (categoryId: string, plannedAmount: number, isMonthly: boolean, dueDate?: string | null) => Promise<void>;
  onPayCategory?: () => void;  // NEW - callback to refresh transactions
  budgetFrameId?: string;
}
```

3. **Update editing state**:
```typescript
const [editingId, setEditingId] = useState<string | null>(null);
const [editValue, setEditValue] = useState('');
const [editIsMonthly, setEditIsMonthly] = useState(false);
const [editDueDate, setEditDueDate] = useState<string>('');  // NEW
```

4. **Update startEdit function**:
```typescript
const startEdit = (cat: Category) => {
  setEditingId(cat.id);
  setEditValue(String(cat.planned_amount || 0));
  setEditIsMonthly(cat.is_monthly || false);
  setEditDueDate(cat.due_date || '');  // NEW
};
```

5. **Update saveEdit function**:
```typescript
const saveEdit = async (categoryId: string) => {
  const planned_amount = parseFloat(editValue);
  if (isNaN(planned_amount) || planned_amount < 0) {
    toast.error('Please enter a valid amount');
    return;
  }

  if (onUpdateCategory && budgetFrameId) {
    try {
      await onUpdateCategory(categoryId, planned_amount, editIsMonthly, editDueDate || null);  // UPDATED
      setEditingId(null);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  } else {
    // Old mutation...
  }
};
```

6. **Add new column header** (after Category):
```typescript
<TableHeader>
  <TableRow className="font-medium opacity-50">
    <TableHead>Category</TableHead>
    <TableHead>Due Date</TableHead>  {/* NEW */}
    <TableHead>Budget</TableHead>
    <TableHead className="hidden lg:table-cell">Total Budget</TableHead>
    <TableHead>Spent</TableHead>
    <TableHead>Remaining</TableHead>
    <TableHead className="w-[50px]"></TableHead>
    <TableHead className="w-[50px]"></TableHead>  {/* NEW - for Pay button */}
  </TableRow>
</TableHeader>
```

7. **Add Due Date cell and Pay button** (in the map function):
```typescript
import { DollarSign } from 'lucide-react';

// ... inside the map function

<TableCell>
  {editingId === cat.id ? (
    <Input
      type="date"
      value={editDueDate}
      onChange={(e) => setEditDueDate(e.target.value)}
      className="w-36 h-8"
    />
  ) : (
    <div className="flex items-center">
      {cat.due_date ? (
        <span className="text-sm">
          {new Date(cat.due_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">Not set</span>
      )}
    </div>
  )}
</TableCell>

{/* ... Budget, Total Budget, Spent, Remaining cells ... */}

{/* Pay Button - Add before Remove button */}
<TableCell>
  <Button
    variant="ghost"
    size="icon"
    onClick={() => {
      setSelectedPayCategory({
        id: cat.id,
        name: cat.name,
        plannedAmount: cat.planned_amount || 0,
      });
      setShowPayModal(true);
    }}
    className="h-8 w-8"
    title="Record payment"
  >
    <DollarSign className="h-4 w-4 text-green-600" />
  </Button>
</TableCell>
```

8. **Add PayCategoryModal** (at the end of component, before closing tag):
```typescript
import { PayCategoryModal } from '@/components/budget/PayCategoryModal';

// ... at the end before closing </Card>

{/* Pay Category Modal */}
{selectedPayCategory && budgetFrameId && (
  <PayCategoryModal
    open={showPayModal}
    onOpenChange={setShowPayModal}
    categoryName={selectedPayCategory.name}
    categoryId={selectedPayCategory.id}
    plannedAmount={selectedPayCategory.plannedAmount}
    budgetFrameId={budgetFrameId}
    onPaymentComplete={() => {
      if (onPayCategory) {
        onPayCategory();
      }
    }}
  />
)}
```

---

### 6. Update `AddCategoryToBudgetModal` component

**File**: `/src/components/budget/AddCategoryToBudgetModal.tsx`

**Changes**:

1. **Update props and state**:
```typescript
interface AddCategoryToBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableCategories: Category[];
  onAdd: (categoryId: string, plannedAmount: number, isMonthly: boolean, dueDate?: string | null) => Promise<void>;  // UPDATED
}

// In component
const [dueDate, setDueDate] = useState<string>('');  // NEW
```

2. **Update handleSubmit**:
```typescript
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
    await onAdd(
      selectedCategoryId,
      parseFloat(plannedAmount),
      isMonthly,
      dueDate || null  // NEW
    );

    // Reset form
    setSelectedCategoryId('');
    setPlannedAmount('');
    setIsMonthly(false);
    setDueDate('');  // NEW
    onOpenChange(false);
  } catch (error) {
    console.error('Error adding category:', error);
  } finally {
    setIsSubmitting(false);
  }
};
```

3. **Add due date input** (after is_monthly checkbox):
```typescript
<div>
  <Label htmlFor="due-date">Due Date (Optional)</Label>
  <Input
    id="due-date"
    type="date"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
  />
</div>
```

---

### 7. Update budget detail page

**File**: `/src/app/(main)/budget/[id]/page.tsx`

**Changes**:

1. **Update handleAddBudgetCategory**:
```typescript
const handleAddBudgetCategory = async (
  categoryId: string,
  plannedAmount: number,
  isMonthly: boolean,
  dueDate?: string | null  // NEW
) => {
  try {
    const response = await fetch('/api/budget-categories/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        budget_frame_id: budgetFrameId,
        category_id: categoryId,
        planned_amount: plannedAmount,
        is_monthly: isMonthly,
        due_date: dueDate,  // NEW
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.error || 'Failed to add category');
      return;
    }

    toast.success('Category added to budget');
    fetchBudgetFrame();
  } catch (error) {
    console.error('Error adding category:', error);
    toast.error('Failed to add category');
  }
};
```

2. **Update handleUpdateBudgetCategory**:
```typescript
const handleUpdateBudgetCategory = async (
  budgetCategoryId: string,
  plannedAmount: number,
  isMonthly: boolean,
  dueDate?: string | null  // NEW
) => {
  try {
    const response = await fetch('/api/budget-categories/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: budgetCategoryId,
        planned_amount: plannedAmount,
        is_monthly: isMonthly,
        due_date: dueDate,  // NEW
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.error || 'Failed to update category');
      return;
    }

    toast.success('Category updated');
    fetchBudgetFrame();
  } catch (error) {
    console.error('Error updating category:', error);
    toast.error('Failed to update category');
  }
};
```

3. **Update wrapper function**:
```typescript
const handleUpdateCategoryWrapper = async (
  categoryId: string,
  plannedAmount: number,
  isMonthly: boolean,
  dueDate?: string | null  // NEW
) => {
  const budgetCategory = budgetFrame?.budget_categories.find(
    bc => bc.category_id === categoryId
  );
  if (budgetCategory) {
    await handleUpdateBudgetCategory(budgetCategory.id, plannedAmount, isMonthly, dueDate);  // UPDATED
  }
};
```

4. **Create handlePaymentComplete**:
```typescript
const handlePaymentComplete = () => {
  // Refresh transactions after payment is recorded
  fetchTransactions();
};
```

5. **Update CategoryBreakdownCard props**:
```typescript
<CategoryBreakdownCard
  budgetedCategories={budgetedCategories}
  unbudgetedCategories={unbudgetedCategories}
  categories={allCategories}
  timeFrameMonths={timeFrameMonths}
  transactions={transactions}
  onUpdateCategory={handleUpdateCategoryWrapper}
  onRemoveCategory={handleRemoveBudgetCategory}
  onAddCategory={handleAddBudgetCategory}
  onPayCategory={handlePaymentComplete}  // NEW
  budgetFrameId={budgetFrameId}
/>
```

6. **Update budgetedCategories useMemo** to include due_date:
```typescript
const budgetedCategories = useMemo(() => {
  if (!budgetFrame) return [];
  return budgetFrame.budget_categories.map(bc => ({
    id: bc.category_id,
    budget_category_id: bc.id,
    name: bc.categories?.name || '',
    color: bc.categories?.color || null,
    planned_amount: Number(bc.planned_amount),
    is_monthly: bc.is_monthly,
    due_date: bc.due_date,  // NEW
    created_at: bc.created_at,
  }));
}, [budgetFrame]);
```

---

## Visual Enhancements (Optional)

### Due Date Indicators
Add visual cues for due dates in CategoryBreakdownCard:

```typescript
// Helper function to check if due date is approaching or past
const getDueDateStatus = (dueDate: string | null | undefined) => {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue'; // Past due
  if (diffDays <= 3) return 'soon'; // Due within 3 days
  if (diffDays <= 7) return 'upcoming'; // Due within a week
  return 'future';
};

// In the due date cell:
const dueDateStatus = getDueDateStatus(cat.due_date);

<TableCell>
  {editingId === cat.id ? (
    // ... edit input
  ) : (
    <div className="flex items-center gap-2">
      {cat.due_date ? (
        <>
          {dueDateStatus === 'overdue' && (
            <div className="h-2 w-2 rounded-full bg-red-500" title="Overdue" />
          )}
          {dueDateStatus === 'soon' && (
            <div className="h-2 w-2 rounded-full bg-orange-500" title="Due soon" />
          )}
          {dueDateStatus === 'upcoming' && (
            <div className="h-2 w-2 rounded-full bg-yellow-500" title="Due this week" />
          )}
          <span className={`text-sm ${dueDateStatus === 'overdue' ? 'text-red-600 font-semibold' : ''}`}>
            {new Date(cat.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </>
      ) : (
        <span className="text-sm text-muted-foreground">Not set</span>
      )}
    </div>
  )}
</TableCell>
```

---

## Implementation Checklist

- [ ] Update Prisma schema with `due_date` field
- [ ] Run `npx prisma db push` to migrate database
- [ ] Update TypeScript types in `/src/types/budgetFrame.ts`
- [ ] Update `/api/budget-categories/add/route.ts` to handle due_date
- [ ] Update `/api/budget-categories/update/route.ts` to handle due_date
- [ ] Create `PayCategoryModal.tsx` component
- [ ] Update `CategoryBreakdownCard.tsx`:
  - Add due date column
  - Add Pay button column
  - Add inline due date editing
  - Add PayCategoryModal integration
- [ ] Update `AddCategoryToBudgetModal.tsx` with due date input
- [ ] Update budget detail page `/budget/[id]/page.tsx`:
  - Update handlers to accept due_date
  - Add payment complete handler
  - Pass props to CategoryBreakdownCard
- [ ] Test the complete flow:
  - Add category with due date
  - Edit due date
  - Record payment via Pay button
  - Verify transaction is created with is_completed: true
  - Verify transaction appears in budget table

---

## Testing Scenarios

1. **Add category with due date**
   - Create new budget category with due date
   - Verify due date appears in breakdown

2. **Add category without due date**
   - Create category without due date
   - Verify "Not set" appears in due date column

3. **Edit due date**
   - Click edit on category
   - Change due date
   - Verify update persists

4. **Record payment**
   - Click Pay button on category
   - Enter payment details
   - Verify transaction created with is_completed: true
   - Verify transaction appears in budget transactions table
   - Verify "Spent" column updates correctly

5. **Due date indicators**
   - Create categories with past, near, and future due dates
   - Verify correct color indicators appear

6. **Edge cases**
   - Record payment with amount different from planned
   - Record multiple payments for same category
   - Remove category with due date
   - Update category that has payments recorded

---

## Notes

- The `is_completed: true` flag marks the transaction as a completed payment
- Transactions with `is_completed: true` should still count toward "Spent" calculations
- The Pay button creates a new transaction; it doesn't modify the budget category itself
- Multiple payments can be recorded for a single category (e.g., partial payments)
- Due dates are optional; categories can exist without them
- Consider adding a filter to show only unpaid categories (those without completed transactions)
