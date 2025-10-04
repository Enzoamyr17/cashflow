# 🚀 Cashflow Tracker - Setup Guide

Complete guide to get your Cashflow Tracker application up and running.

---

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- A Supabase account (free tier works!)

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

#### A. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in project details:
   - **Name**: Cashflow Tracker
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier
5. Wait 2-3 minutes for project setup

#### B. Get API Credentials

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public API Key** (starts with `eyJ...`)

#### C. Create Environment File

Create a file named `.env.local` in the project root:

```bash
# In project root directory
touch .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace with your actual values from Step 2B!

### 3. Run Database Migrations

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project → **SQL Editor**
2. Run each migration file in order:

**Migration 1: Create Users Table**
```bash
# Copy contents of: supabase/migrations/001_create_users_table.sql
# Paste into SQL Editor and click "Run"
```

**Migration 2: Create Categories Table**
```bash
# Copy contents of: supabase/migrations/002_create_categories_table.sql
# Paste and run
```

**Migration 3: Create Transactions Table**
```bash
# Copy contents of: supabase/migrations/003_create_transactions_table.sql
# Paste and run
```

**Migration 4: Create RPC Functions**
```bash
# Copy contents of: supabase/migrations/004_create_rpc_functions.sql
# Paste and run
```

**Migration 5: Setup RLS Policies**
```bash
# Copy contents of: supabase/migrations/005_setup_rls_policies.sql
# Paste and run
```

**Migration 6: Seed Data (Optional)**
```bash
# Copy contents of: supabase/migrations/006_seed_data.sql
# Paste and run (this creates test user with code "test123")
```

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install supabase --save-dev

# Initialize Supabase
npx supabase init

# Link to your project
npx supabase link --project-ref your-project-id

# Push migrations
npx supabase db push
```

### 4. Verify Database Setup

1. Go to Supabase Dashboard → **Table Editor**
2. Verify these tables exist:
   - ✅ `users`
   - ✅ `categories`
   - ✅ `transactions`
3. Go to **Database** → **Policies**
4. Verify RLS is enabled for all tables

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 First Time Usage

### Login / Create Account

1. You'll be redirected to the login page
2. Enter any user code (case-sensitive) - examples:
   - `test123` (if you ran seed data)
   - `myusername`
   - `john_doe_2024`
3. Click **"Login / Create Account"**
   - If the code exists → You'll be logged in
   - If it doesn't exist → A new account is created
4. Session lasts until midnight (resets daily)

### Dashboard Features

- **Header Cards**: Shows Balance, Income, Expenses
- **Filters**: Filter by date range, type, category
- **Add Transaction**: Click button to add inline
- **Edit/Delete**: Click on rows to modify

### Budget Page

1. Set **Start Date**, **End Date**, **Starting Budget**
2. Add planned expenses
3. View projections vs actuals
4. Mark planned items as completed
5. Track category breakdowns

---

## 🛠️ Development

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   │   └── login/         # Login page
│   ├── (main)/            # Protected main app routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── budget/        # Budget page
│   │   └── components/    # Shared layout components
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home (redirect logic)
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   └── common/           # Common components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and helpers
├── server/               # Server-side functions
└── types/                # TypeScript type definitions

supabase/
└── migrations/           # Database migration files
```

### Key Technologies

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn/UI
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Charts**: Recharts

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 🎨 Features

### ✅ Implemented

- [x] UserCode authentication (case-sensitive)
- [x] Session management (daily expiry)
- [x] Dashboard with filters
- [x] Transaction management (CRUD)
- [x] Budget planning
- [x] Category management
- [x] Dark mode toggle
- [x] Responsive design
- [x] Real-time calculations
- [x] Multiple payment methods

### 🚀 Planned (See TODO.md)

- [ ] Export to CSV/PDF
- [ ] Recurring transactions
- [ ] Charts and visualizations
- [ ] Multi-currency support
- [ ] Budget alerts

---

## 🐛 Troubleshooting

### Can't connect to Supabase

**Problem**: App can't connect to database

**Solutions**:
1. Check `.env.local` has correct values
2. Verify no trailing slashes in `NEXT_PUBLIC_SUPABASE_URL`
3. Ensure Supabase project is not paused
4. Check browser console for specific errors

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
1. Delete `.next` folder and node_modules
2. Run `npm install` again
3. Check for TypeScript errors: `npx tsc --noEmit`

### Session Expiring

**Problem**: Logged out unexpectedly

**Expected Behavior**: Sessions expire at midnight daily (by design)

**To Change**: Modify `src/lib/storage.ts` → `getMidnightTonight()` function

### RLS Policy Errors

**Problem**: "Row Level Security policy violation"

**Solutions**:
1. Verify RLS policies were created (Step 3)
2. Check Supabase logs: Dashboard → Logs → Postgres Logs
3. Re-run migration `005_setup_rls_policies.sql`

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Click **"Import Project"**
4. Select your repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **"Deploy"**

Your app will be live at `https://your-app.vercel.app`

### Environment Variables in Vercel

1. Project Settings → Environment Variables
2. Add both variables
3. Select: **Production**, **Preview**, **Development**
4. Redeploy if needed

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn/UI Components](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com)

---

## 🤝 Support

For issues or questions:
1. Check [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for current status
2. Review [TODO.md](TODO.md) for planned features
3. Check [USERTODO.md](USERTODO.md) for manual setup tasks

---

## 📝 License

This project is open source and available under the MIT License.

---

**Happy tracking! 💸**
