# 💸 Cashflow Tracker - Project TODO

**Last Updated:** 2025-10-04
**Status:** Initial Setup

---

## Phase 1: Project Setup & Configuration

- [ ] Initialize Next.js 14 project with TypeScript and App Router
- [ ] Install and configure dependencies:
  - [ ] TailwindCSS
  - [ ] Shadcn/UI
  - [ ] Supabase client
  - [ ] React Query
  - [ ] Zustand
  - [ ] Recharts
- [ ] Set up project folder structure according to PRD hierarchy
- [ ] Configure Tailwind with custom color palette (bluish minimal theme)
- [ ] Set up globals.css with base styles
- [ ] Configure environment variables for Supabase connection

---

## Phase 2: Supabase Backend Setup

### Database Schema & Migrations

- [ ] Create Supabase project
- [ ] Create migration for `users` table
  - [ ] id (uuid, pk)
  - [ ] userCode (text, unique, case-sensitive)
  - [ ] name (text, nullable)
  - [ ] created_at (timestamptz)
- [ ] Create migration for `categories` table
  - [ ] id (uuid, pk)
  - [ ] user_id (uuid, fk → users.id)
  - [ ] name (text, not null)
  - [ ] color (text, nullable)
  - [ ] created_at (timestamptz)
- [ ] Create migration for `transactions` table
  - [ ] id (uuid, pk)
  - [ ] user_id (uuid, fk → users.id)
  - [ ] category_id (uuid, fk → categories.id)
  - [ ] type (enum: 'income', 'expense')
  - [ ] amount (decimal(10,2), check > 0)
  - [ ] method (enum: Cash, Gcash, Seabank, UBP, Other Bank, Others)
  - [ ] notes (text, nullable)
  - [ ] date (date, not null)
  - [ ] is_planned (boolean, default false)
  - [ ] is_completed (boolean, default false)
  - [ ] created_at (timestamptz)

### Database Functions & Security

- [ ] Create RPC function `verify_user_code(code text)`
- [ ] Set up Row-Level Security (RLS) policies
  - [ ] Policy for users table
  - [ ] Policy for categories table
  - [ ] Policy for transactions table
- [ ] Create seed.sql with sample data and default payment methods
- [ ] Run migrations and test database setup

---

## Phase 3: Core Library & Utilities

### Supabase Integration

- [ ] Create `lib/supabaseClient.ts` - Supabase client instance
- [ ] Create `lib/auth.ts` - Custom userCode authentication logic
- [ ] Create `lib/storage.ts` - localStorage session handling (daily expiry)

### Data Layer

- [ ] Create `lib/api.ts` - Reusable data fetching utilities
- [ ] Create `server/users.ts` - User CRUD operations
- [ ] Create `server/categories.ts` - Category CRUD operations
- [ ] Create `server/transactions.ts` - Transaction CRUD & projections
- [ ] Create `server/analytics.ts` - Dashboard aggregates (totals, charts)

### Helpers & Types

- [ ] Create `lib/calculations.ts` - Balance, totals, category remaining
- [ ] Create `lib/utils.ts` - Date formatting, number formatting
- [ ] Create `types/user.ts` - User interfaces
- [ ] Create `types/transaction.ts` - Transaction interfaces
- [ ] Create `types/budget.ts` - Budget interfaces
- [ ] Create `types/index.ts` - Shared type exports
- [ ] Create `types/dbTypes.ts` - Generated types from Supabase schema

---

## Phase 4: Custom Hooks

- [ ] Create `hooks/useAuth.ts` - Authentication & session state
- [ ] Create `hooks/useTransactions.ts` - React Query hooks for transactions
- [ ] Create `hooks/useBudgets.ts` - React Query hooks for budgets
- [ ] Create `hooks/useFilters.ts` - Filter state management (Zustand)
- [ ] Create `hooks/useTheme.ts` - Dark mode state (localStorage persistence)

---

## Phase 5: Shared UI Components

### Shadcn/UI Components

- [ ] Install and configure base Shadcn components:
  - [ ] Button
  - [ ] Card
  - [ ] Input
  - [ ] Select
  - [ ] Table
  - [ ] Dialog
  - [ ] Toast
  - [ ] Popover
  - [ ] Calendar

### Common Components

- [ ] Create `components/common/LoadingSpinner.tsx`
- [ ] Create `components/common/EmptyState.tsx`
- [ ] Create `components/common/ConfirmDialog.tsx`
- [ ] Create `components/common/InlineEditField.tsx`

---

## Phase 6: Authentication Flow

### Login Page (`/login`)

- [ ] Create `app/(auth)/login/page.tsx`
- [ ] Implement login UI (centered card, minimal design)
- [ ] Add single input field for userCode (case-sensitive)
- [ ] Add "Login" and "Create Account" buttons
- [ ] Implement login logic:
  - [ ] Check if user exists → log in
  - [ ] If not exists → create new user
- [ ] Save session to localStorage with daily expiry (midnight reset)
- [ ] Redirect to `/dashboard` after successful login
- [ ] Add error handling and toast notifications

### Session Management

- [ ] Implement session persistence check
- [ ] Auto-redirect from `/login` if session valid
- [ ] Auto-redirect to `/login` if session expired
- [ ] Clear session at midnight (daily reset)

---

## Phase 7: Dashboard Page (`/dashboard`)

### Layout & Container

- [ ] Create `app/(main)/components/PageContainer.tsx`
- [ ] Create `app/(main)/components/Navbar.tsx`
- [ ] Create `app/(main)/components/Sidebar.tsx`
- [ ] Create `app/(main)/components/DarkModeToggle.tsx`

### Dashboard Header

- [ ] Create `app/(main)/dashboard/components/DashboardHeader.tsx`
- [ ] Create `app/(main)/dashboard/components/ChartCard.tsx`
- [ ] Implement Balance card with mini-chart (Recharts)
- [ ] Implement Total Income card with trend visualization
- [ ] Implement Total Expenses card with trend visualization
- [ ] Connect to real-time data from React Query hooks

### Dashboard Filters

- [ ] Create `app/(main)/dashboard/components/DashboardFilters.tsx`
- [ ] Implement Date Range filter
- [ ] Implement Type filter (Income/Expense)
- [ ] Implement Category filter
- [ ] Connect filters to transaction list

### Transaction Table

- [ ] Create `app/(main)/dashboard/components/TransactionTable.tsx`
- [ ] Create `app/(main)/dashboard/components/TransactionRow.tsx`
- [ ] Create `app/(main)/dashboard/components/AddTransactionRow.tsx`
- [ ] Implement table columns:
  - [ ] Date
  - [ ] Type
  - [ ] Category
  - [ ] Description
  - [ ] Amount
  - [ ] Payment Method
  - [ ] Notes
  - [ ] Actions (Edit/Delete)
- [ ] Implement inline add functionality (topmost row)
  - [ ] Auto-save on blur
  - [ ] Auto-save on Enter key
- [ ] Implement inline edit functionality
  - [ ] Click to edit
  - [ ] Save on blur
- [ ] Implement delete with confirmation dialog
- [ ] Add pagination (20 per page)
- [ ] Implement lazy loading
- [ ] Implement optimistic UI updates

### Dashboard Main Page

- [ ] Create `app/(main)/dashboard/page.tsx`
- [ ] Integrate all dashboard components
- [ ] Test real-time data updates
- [ ] Test filters and pagination

---

## Phase 8: Budget Page (`/budget`)

### Budget Header & Summary

- [ ] Create `app/(main)/budget/components/BudgetHeader.tsx`
- [ ] Create `app/(main)/budget/components/BudgetSummaryCard.tsx`
- [ ] Implement input fields:
  - [ ] Start Date
  - [ ] End Date
  - [ ] Starting Budget
- [ ] Implement auto-calculated fields:
  - [ ] Time Frame (days between start-end)
  - [ ] Projected Expenses (from planned transactions)
  - [ ] Actual Expenses (from completed transactions)
- [ ] Implement Category Breakdown (inline display of remaining per category)

### Planned Transactions Table

- [ ] Create `app/(main)/budget/components/BudgetTable.tsx`
- [ ] Create `app/(main)/budget/components/PlannedTransactionRow.tsx`
- [ ] Implement all transaction columns plus Status column
- [ ] Add Status toggle (Pending/Completed)
- [ ] When marked Completed:
  - [ ] Move to `/dashboard` view
  - [ ] Update actual expenses
  - [ ] Update category breakdown
- [ ] Implement inline add/edit/delete
- [ ] Add optimistic updates

### Budget Main Page

- [ ] Create `app/(main)/budget/page.tsx`
- [ ] Integrate budget components
- [ ] Test projected vs actual sync
- [ ] Test category auto-updates

---

## Phase 9: Root Layout & Routing

- [ ] Create `app/layout.tsx` - Root layout
  - [ ] Add ThemeProvider
  - [ ] Add QueryClientProvider (React Query)
  - [ ] Add Toaster for notifications
- [ ] Create `app/page.tsx` - Root redirect logic
  - [ ] Redirect to `/login` if no session
  - [ ] Redirect to `/dashboard` if session exists
- [ ] Set up protected route middleware
- [ ] Test navigation flow

---

## Phase 10: Theming & Styling

- [ ] Implement dark mode toggle functionality
- [ ] Add dark mode classes to all components
- [ ] Configure Tailwind dark mode variants
- [ ] Test dark mode color palette:
  - [ ] Dark background: `#0F172A`
  - [ ] Dark accent: `#60A5FA`
- [ ] Persist dark mode preference to localStorage
- [ ] Add smooth transitions for theme switching

---

## Phase 11: Responsive Design

- [ ] Implement mobile-first breakpoints
- [ ] Make tables collapse into vertical lists on mobile
- [ ] Ensure header cards are responsive
- [ ] Make header sticky on scroll
- [ ] Test on various screen sizes:
  - [ ] Mobile (320px - 640px)
  - [ ] Tablet (640px - 1024px)
  - [ ] Desktop (1024px+)
- [ ] Optimize touch interactions for mobile

---

## Phase 12: Charts & Visualizations

- [ ] Implement Recharts mini-graphs for header cards
- [ ] Create Balance trend line chart
- [ ] Create Income bar/line chart
- [ ] Create Expenses bar/line chart
- [ ] Add responsive chart sizing
- [ ] Test chart performance with large datasets
- [ ] Style charts to match minimal theme

---

## Phase 13: Optimistic UI & Error Handling

- [ ] Implement optimistic updates for:
  - [ ] Add transaction
  - [ ] Edit transaction
  - [ ] Delete transaction
  - [ ] Mark planned transaction as completed
- [ ] Add rollback logic for failed mutations
- [ ] Implement toast notifications for:
  - [ ] Success messages
  - [ ] Error messages
  - [ ] Warning messages
- [ ] Add loading states for all async operations
- [ ] Test error scenarios and recovery

---

## Phase 14: Testing & Quality Assurance

### Functional Testing

- [ ] Test userCode login (case-sensitive)
- [ ] Test user creation flow
- [ ] Test session persistence (daily expiry)
- [ ] Test logout and session clearing
- [ ] Test all transaction CRUD operations
- [ ] Test filters (date, type, category)
- [ ] Test pagination and lazy loading
- [ ] Test budget calculations
- [ ] Test planned → completed transaction flow
- [ ] Test category breakdown updates
- [ ] Test dark mode toggle

### Performance Testing

- [ ] Test with 100+ transactions
- [ ] Test optimistic UI responsiveness
- [ ] Test chart rendering performance
- [ ] Test mobile performance
- [ ] Optimize bundle size
- [ ] Check for memory leaks

### Security Testing

- [ ] Verify RLS policies work correctly
- [ ] Test userCode authentication security
- [ ] Verify users can only access own data
- [ ] Test input sanitization
- [ ] Check for XSS vulnerabilities

---

## Phase 15: Deployment

- [ ] Set up Vercel project
- [ ] Configure environment variables in Vercel
- [ ] Connect Vercel to GitHub repo
- [ ] Deploy to production
- [ ] Test production build
- [ ] Verify Supabase connection in production
- [ ] Set up custom domain (optional)
- [ ] Configure analytics (optional)

---

## Phase 16: Acceptance Criteria Verification

- [ ] ✅ Login with userCode works and persists for one day
- [ ] ✅ Inline add/edit/delete for transactions functional
- [ ] ✅ Filters (date, type, category) work correctly
- [ ] ✅ Budgeting page handles projected/actual sync correctly
- [ ] ✅ Header stats and charts update in real time
- [ ] ✅ Dark mode toggle persists across sessions
- [ ] ✅ Fully responsive layout on all devices
- [ ] ✅ Smooth performance with optimistic updates

---

## Future Enhancements (Backlog)

- [ ] Export transactions to CSV
- [ ] Export transactions to PDF
- [ ] Add monthly charts view
- [ ] Implement recurring transactions
- [ ] Add budget alerts (overspend notifications)
- [ ] Create shared view for multi-user households
- [ ] Add transaction search functionality
- [ ] Implement data backup/restore
- [ ] Add multi-currency support
- [ ] Create mobile app (React Native)

---

**Total Tasks:** ~150+
**Estimated Timeline:** 4-6 weeks (solo developer)
**Priority:** High → Core features first, enhancements later
