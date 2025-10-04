# 💸 Cashflow Tracker

A modern, elegant personal finance tracker built with Next.js 14, Supabase, and TypeScript.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

---

## ✨ Features

- 🔐 **Simple Authentication** - Login with a unique user code
- 💰 **Transaction Management** - Track income and expenses with categories
- 📊 **Budget Planning** - Plan expenses and track against actual spending
- 🎨 **Dark Mode** - Beautiful UI with light/dark theme toggle
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Real-time Updates** - Optimistic UI with instant feedback
- 🔒 **Secure** - Row-level security with Supabase

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start tracking!

**📖 Detailed Setup:** See [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete instructions.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | Complete setup instructions |
| **[USERTODO.md](USERTODO.md)** | Manual setup tasks (Supabase, env vars) |
| **[UPDATES.md](UPDATES.md)** | ⭐ Latest fixes and improvements |
| **[TODO.md](TODO.md)** | Project roadmap and future features |
| **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** | Current implementation status |
| **[PRD.md](PRD.md)** | Product requirements document |
| **[backend.md](backend.md)** | Backend architecture details |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Database:** Supabase (PostgreSQL)
- **Styling:** TailwindCSS 4 + Shadcn/UI
- **State:** Zustand
- **Data Fetching:** TanStack React Query
- **Charts:** Recharts

---

## 🎯 Key Features

### Dashboard
- View all transactions at a glance
- Filter by date, type, and category
- Real-time balance, income, and expenses

### Budget Page
- Plan future expenses
- Track projected vs actual spending
- Category-wise breakdown
- Mark planned transactions as completed

### Authentication
- UserCode-based (no email required)
- Auto-create accounts on first login
- Sessions expire at midnight daily

---

## ⚙️ Setup Requirements

Before running the app, you need to:

1. ✅ Create a Supabase project
2. ✅ Run database migrations
3. ✅ Add environment variables
4. ✅ Install dependencies

**See [USERTODO.md](USERTODO.md) for step-by-step instructions.**

---

## 📦 Project Structure

```
src/
├── app/              # Next.js pages
├── components/       # React components
├── hooks/           # Custom hooks
├── lib/             # Utilities
├── server/          # API functions
└── types/           # TypeScript types

supabase/
└── migrations/      # Database migrations
```

---

## 🚢 Deployment

Deploy to Vercel in 3 steps:

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables and deploy

---

## 📝 License

MIT License - feel free to use for personal or commercial projects.

---

## 🙏 Built With

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)

---

**Status:** ✅ Production Ready

**Version:** 1.0.0

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for details.
