# 🔧 User Manual Tasks - Cashflow Tracker

**Last Updated:** 2025-10-04

These are tasks that require manual action outside this repository. Complete these before or during development as needed.

---

## 🗄️ Supabase Setup (Required Before Phase 2)

### 1. Create Supabase Project

- [ ] Go to [https://supabase.com](https://supabase.com)
- [ ] Sign up or log in to your account
- [ ] Click "New Project"
- [ ] Fill in project details:
  - **Name:** Cashflow Tracker (or your preference)
  - **Database Password:** Choose a strong password (save this!)
  - **Region:** Choose closest to your location
  - **Pricing Plan:** Free tier is sufficient to start
- [ ] Wait for project to finish setting up (~2 minutes)

### 2. Get Supabase API Credentials

After project is created:

- [ ] Go to Project Settings (gear icon) → API
- [ ] Copy the following values:
  - **Project URL** (looks like: `https://xxxxx.supabase.co`)
  - **Project API Key (anon/public)** (starts with `eyJ...`)
- [ ] Save these securely - you'll need them for environment variables

### 3. Create Environment Variables File

- [ ] In your project root, create a file named `.env.local`
- [ ] Add the following content (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

- [ ] Ensure `.env.local` is in your `.gitignore` (already included in Next.js by default)

### 4. Run Database Migrations

After the migration files are created in this repo:

- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Click "New Query"
- [ ] Copy the contents of `supabase/migrations/001_create_users_table.sql`
- [ ] Paste and run the query
- [ ] Repeat for each migration file in order:
  - `002_create_categories_table.sql`
  - `003_create_transactions_table.sql`
  - `004_create_rpc_functions.sql`
  - `005_setup_rls_policies.sql`
  - `006_seed_data.sql` (optional - sample data)

**Alternative:** If Supabase CLI is set up:
```bash
npx supabase db push
```

### 5. Verify Database Setup

- [ ] Go to Supabase Dashboard → Table Editor
- [ ] Verify these tables exist:
  - `users`
  - `categories`
  - `transactions`
- [ ] Go to Authentication → Policies
- [ ] Verify RLS policies are enabled for each table

---

## 🚀 Deployment Setup (Phase 15)

### 1. Vercel Account Setup

- [ ] Go to [https://vercel.com](https://vercel.com)
- [ ] Sign up or log in (recommend using GitHub)
- [ ] Connect your GitHub account if not already connected

### 2. Deploy Project

- [ ] Click "Add New Project"
- [ ] Import your `cashflow` repository
- [ ] Configure project:
  - **Framework Preset:** Next.js
  - **Root Directory:** `./` (default)
  - **Build Command:** `npm run build` (default)
  - **Output Directory:** `.next` (default)

### 3. Add Environment Variables in Vercel

- [ ] In Vercel project settings → Environment Variables
- [ ] Add the following variables:
  - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
  - **Value:** Your Supabase project URL
  - **Environments:** Production, Preview, Development
- [ ] Add second variable:
  - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **Value:** Your Supabase anon key
  - **Environments:** Production, Preview, Development

### 4. Deploy

- [ ] Click "Deploy"
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Visit your deployed URL (e.g., `cashflow.vercel.app`)
- [ ] Test the application in production

### 5. Optional: Custom Domain

- [ ] In Vercel project → Settings → Domains
- [ ] Add your custom domain
- [ ] Follow DNS configuration instructions
- [ ] Wait for SSL certificate to be issued (~24 hours)

---

## 📦 Local Development Setup (Phase 1)

### 1. Node.js Installation (if not installed)

- [ ] Check if Node.js is installed: `node --version`
- [ ] If not, download from [https://nodejs.org](https://nodejs.org)
- [ ] Install Node.js v18.x or higher
- [ ] Verify installation: `node --version` and `npm --version`

### 2. Install Dependencies

This will be done automatically, but manual steps:

```bash
cd /Users/renzo/Documents/GitHub/cashflow
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

- [ ] Open browser to `http://localhost:3000`
- [ ] Verify app loads correctly

---

## 🔐 Security Checklist

### Before Deployment

- [ ] Ensure `.env.local` is in `.gitignore`
- [ ] Never commit API keys to Git
- [ ] Verify Supabase RLS policies are enabled
- [ ] Test that users can only access their own data
- [ ] Review Supabase dashboard for any exposed credentials

### After Deployment

- [ ] Test production site with real userCode
- [ ] Verify data isolation between users
- [ ] Check browser console for exposed secrets
- [ ] Test authentication flow in production
- [ ] Monitor Supabase dashboard for unusual activity

---

## ✅ Optional Enhancements

### Analytics (Optional)

- [ ] Set up Vercel Analytics (free tier available)
- [ ] Go to Vercel project → Analytics tab
- [ ] Enable Web Analytics

### Monitoring (Optional)

- [ ] Set up Supabase monitoring alerts
- [ ] Go to Supabase Dashboard → Reports
- [ ] Configure email alerts for:
  - High database usage
  - API rate limits
  - Authentication failures

### Backup Strategy (Recommended)

- [ ] Enable Supabase automatic backups (paid plans)
- [ ] Or set up manual backup schedule:
  - Go to Database → Backups
  - Download database dump weekly

---

## 📝 Notes

- **API Keys**: Keep your Supabase keys secure. The anon key is safe for client-side use only because of RLS policies.
- **Database Password**: Save your database password securely - you'll need it for direct database access.
- **Free Tier Limits**: Supabase free tier includes 500MB database, 1GB file storage, 2GB bandwidth/month.
- **Vercel Limits**: Free tier includes unlimited deployments, 100GB bandwidth/month.

---

## 🆘 Troubleshooting

### Can't connect to Supabase
- Verify environment variables are set correctly
- Check Supabase project status (not paused)
- Ensure API URL doesn't have trailing slash

### Build fails on Vercel
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Try building locally: `npm run build`

### RLS Policies blocking access
- Check Supabase SQL Editor logs
- Verify user is authenticated correctly
- Test RLS policies in Supabase dashboard

---

**Total Manual Tasks:** ~30
**Estimated Time:** 30-45 minutes
**Must Complete Before:** Phase 2 (Supabase), Phase 15 (Deployment)
