# 💸 Cashflow Tracker and Dashboard — PRD

## Overview

A minimalist, performant, and mobile-first **Cashflow Tracker and Expenses Dashboard** built with **Next.js (TypeScript)**, **Supabase**, **TailwindCSS**, and **Shadcn/UI**.  
Authentication is handled using unique, case-sensitive **usercodes**, without passwords.  

Target users: You (Renzo) and your partner.

---

## 🎯 Core Objectives

- Track and visualize income, expenses, and overall balance.
- Plan and manage budgets with projected vs actual comparisons.
- Keep UI minimal (Notion-style) but performant.
- Maintain smooth UX with optimistic UI and instant updates.

---

## 🧩 Tech Stack

| Area | Tech |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI Library | Shadcn/UI |
| Styling | TailwindCSS |
| Backend | Supabase (PostgreSQL + Supabase Client) |
| Charts | Recharts |
| Data Fetching | React Query |
| State Management | React Query + Zustand (for lightweight local state) |
| Hosting | Vercel (Frontend), Supabase (Backend) |

---

## 🎨 Design & Theme

**Design Philosophy:**  
Clean. Neutral. Functional. Similar to Notion’s minimalist interface.

**Color Palette (Bluish Minimal Theme):**
| Role | Color | Notes |
|------|--------|-------|
| Background | `#F8FAFC` | Light neutral background |
| Surface | `#CBD5E1` | Card, table borders |
| Accent | `#3B82F6` | Buttons, highlights |
| Text Primary | `#0F172A` | Headings, main text |
| Text Secondary | `#64748B` | Muted labels |
| Dark Mode Background | `#0F172A` | Dark mode base |
| Dark Mode Accent | `#60A5FA` | Accent for dark mode elements |

**Typography:**  
`font-sans` (Inter / system default)

**Layout Guidelines:**
- Card-based grid layout
- Rounded corners (`rounded-2xl`)
- Soft shadows (`shadow-md`)
- Mobile-first breakpoints
- Compact Recharts line/bar charts inside header cards

---

## 🔒 Authentication

- **Login using usercode**
  - Case-sensitive and unique.
  - Acts as both username and password.
- **Persistence:** stored in localStorage until midnight (daily expiry).
- **No passwords, no emails, no external auth.**

---

## 📑 Pages & Features

### 1. Login Page (`/login`)
- Single field: `usercode`
- Buttons: `Login` and `Create Account`
- If user exists → log in  
  If not → create user
- Save session to localStorage
- Redirect to `/dashboard` after login
- Minimal aesthetic: centered card with light accent color

---

### 2. Dashboard (`/dashboard`)

#### **Header**
Displays real-time computed stats:
- **Balance** — Total after income/expenses
- **Total Income**
- **Total Expenses**

Each header card includes a small Recharts mini-graph (trendline or mini bar).

#### **Filters**
- Filter by:
  - Date Range
  - Type (Income / Expense)
  - Category
- Filters affect the transaction list immediately.

#### **Cashflow Table**
| Column | Description |
|--------|--------------|
| Date | Date of transaction |
| Type | Income or Expense |
| Category | User-defined category |
| Description | Short text |
| Amount | Positive only |
| Payment Method | Enum |
| Notes | Optional text |

**Behaviors:**
- Inline Add Transaction row (topmost)
  - Auto-save on blur or Enter key
- Inline Edit
  - Editable on click, saves on blur
- Delete
  - Inline trash icon with confirmation
- Pagination (20 per page) + Lazy Loading
- Optimistic Updates
  - Instant UI updates before Supabase commit

---

### 3. Budgeting Page (`/budget`)
Similar structure to Dashboard but for **planned transactions**.

#### **Header Fields**
| Field | Type | Description |
|--------|------|-------------|
| Start Date | Input | Budget start |
| End Date | Input | Budget end |
| Starting Budget | Input | Initial funds |
| Time Frame | Auto | Days between start–end |
| Projected Expenses | Auto | From planned transactions |
| Actual Expenses | Auto | From completed ones |
| Category Breakdown | Inline | Displays remaining per category |

#### **Body (Planned Transactions Table)**
- Same columns as dashboard
- Additional column: `Status` (`Pending` / `Completed`)
- When marked `Completed`, it appears in `/dashboard` and affects totals
- Category data auto-syncs with budget calculations

---

## 🧱 Database Schema (Supabase)

### **users**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| usercode | text | Unique, case-sensitive |
| created_at | timestamp | Default: now() |

### **transactions**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK → users.id |
| date | date | Transaction date |
| type | text | `'income'` or `'expense'` |
| category | text | User-defined |
| description | text | Optional |
| amount | numeric | > 0 only |
| payment_method | text | Enum (`Cash`, `Gcash`, `Seabank`, `UBP`, `Other Bank`, `Others`) |
| notes | text | Optional |
| created_at | timestamp | Default: now() |

### **budgets**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK → users.id |
| start_date | date | Start of budgeting period |
| end_date | date | End of budgeting period |
| starting_budget | numeric | Initial allocation |
| projected_expenses | numeric | From planned transactions |
| actual_expenses | numeric | From completed |
| created_at | timestamp | Default: now() |

### **budget_categories**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| budget_id | uuid | FK → budgets.id |
| name | text | Category name |
| amount | numeric | Allocated |
| spent | numeric | Auto-updated |
| remaining | numeric | Calculated |

### **planned_transactions**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| budget_id | uuid | FK → budgets.id |
| user_id | uuid | FK → users.id |
| date | date | Planned transaction date |
| type | text | `'income'` or `'expense'` |
| category | text | User-defined |
| description | text | Optional |
| amount | numeric | > 0 only |
| payment_method | text | Enum |
| notes | text | Optional |
| status | text | `'pending'` / `'completed'` |
| created_at | timestamp | Default: now() |

---

## 🧠 Component Hierarchy

src/
│
├── app/
│ ├── layout.tsx # Root layout (ThemeProvider, QueryProvider, etc.)
│ ├── page.tsx # Redirects to /login or /dashboard
│ ├── (auth)/
│ │ └── login/
│ │ └── page.tsx # Login screen
│ ├── (main)/
│ │ ├── dashboard/
│ │ │ ├── page.tsx # Dashboard main page
│ │ │ └── components/
│ │ │ ├── DashboardHeader.tsx
│ │ │ ├── DashboardFilters.tsx
│ │ │ ├── TransactionTable.tsx
│ │ │ ├── TransactionRow.tsx
│ │ │ ├── AddTransactionRow.tsx
│ │ │ └── ChartCard.tsx
│ │ ├── budget/
│ │ │ ├── page.tsx # Budget page
│ │ │ └── components/
│ │ │ ├── BudgetHeader.tsx
│ │ │ ├── BudgetSummaryCard.tsx
│ │ │ ├── BudgetTable.tsx
│ │ │ └── PlannedTransactionRow.tsx
│ │ └── components/
│ │ ├── Navbar.tsx
│ │ ├── Sidebar.tsx
│ │ ├── DarkModeToggle.tsx
│ │ └── PageContainer.tsx
│ └── api/
│ └── supabase/ # Supabase client-side logic
│
├── components/
│ ├── ui/ # Shadcn components
│ └── common/
│ ├── LoadingSpinner.tsx
│ ├── EmptyState.tsx
│ ├── ConfirmDialog.tsx
│ └── InlineEditField.tsx
│
├── lib/
│ ├── supabase.ts # Supabase client instance
│ ├── auth.ts # Custom usercode auth logic
│ ├── transactions.ts # CRUD helpers for transactions
│ ├── budgets.ts # CRUD helpers for budgets
│ ├── calculations.ts # Helper functions (balance, totals, etc.)
│ ├── storage.ts # LocalStorage session handling
│ └── utils.ts # Date, format, etc.
│
├── hooks/
│ ├── useTransactions.ts # React Query hooks for transactions
│ ├── useBudgets.ts # React Query hooks for budgets
│ ├── useAuth.ts # Auth + session state
│ ├── useTheme.ts # Dark mode state
│ └── useFilters.ts # Filter state management
│
├── styles/
│ └── globals.css # Tailwind base + custom styles
│
└── types/
├── index.ts # Shared type exports
├── transaction.ts # Transaction interfaces
├── budget.ts # Budget interfaces
└── user.ts # User interface


---

## ⚙️ Architecture & Conventions

- **Atomic Components:**  
  Reusable, self-contained UI components with props-based data.
- **Data Fetching:**  
  All Supabase queries wrapped in React Query hooks.
- **Optimistic Updates:**  
  Implement via `onMutate`, `onSuccess`, and `onError` patterns.
- **Theming:**  
  Dark mode toggle persists via localStorage + Tailwind `dark` class.
- **Error Handling:**  
  Inline notifications (toasts) using Shadcn UI’s `use-toast` hook.

---

## 📱 Responsiveness

- **Mobile-first**
  - Tables collapse into vertical lists on smaller screens
- **Header always visible**
  - Sticky at top for key totals
- **Dark Mode Toggle**
  - Persistent per user preference

---

## 🧮 Calculations

**Balance:**  
`total_income - total_expenses`

**Projected Expenses (Budget Page):**  
Sum of all planned transactions (type = expense)

**Actual Expenses (Budget Page):**  
Sum of completed planned transactions (type = expense)

**Category Remaining:**  
`category.amount - category.spent`

---

## ✅ Acceptance Criteria

- Login with usercode works and persists for one day
- Inline add/edit/delete for transactions functional
- Filters (date, type, category) work
- Budgeting page handles projected/actual sync correctly
- Header stats and charts update in real time
- Dark mode toggle persists
- Fully responsive layout
- Smooth performance with optimistic updates

---

## 🧾 Future Enhancements

- Export to CSV or PDF
- Monthly charts
- Recurring transactions
- Budget alerts (overspend notifications)
- Shared view for multi-user households

---

**Author:** Renzo  
**Last Updated:** 2025-10-04  
**Version:** v1.1 (with folder hierarchy)
