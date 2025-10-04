# Backend.md - Cashflow Tracker & Dashboard (Supabase + Next.js)

## Overview

The backend is powered by **Supabase** (PostgreSQL + Supabase Auth) and serves as the data layer for the Cashflow Tracker app. It handles data persistence, authentication via unique `userCode`, and real-time synchronization with the frontend for optimal perceived performance.

---

## Key Features

* Custom lightweight user authentication using unique `userCode`.
* Persistent daily login sessions (reset every 00:00 local time).
* Auto-generated database schema based on setup (migrations defined below).
* Instant optimistic updates for all mutations.
* Lazy-loaded and paginated queries.
* Automatic projected expense computation from planned transactions.
* Real-time syncing between transactions and budgeting dashboards.

---

## Database Schema

### Tables

#### 1. `users`

| Column     | Type        | Constraints      | Description                        |
| ---------- | ----------- | ---------------- | ---------------------------------- |
| id         | uuid        | pk               | Auto-generated UUID                |
| userCode   | text        | unique, not null | Unique login code (case-sensitive) |
| name       | text        | nullable         | Optional display name              |
| created_at | timestamptz | default now()    | Date user was created              |

#### 2. `categories`

| Column     | Type        | Constraints    | Description           |
| ---------- | ----------- | -------------- | --------------------- |
| id         | uuid        | pk             | Auto-generated        |
| user_id    | uuid        | fk -> users.id | Owner of category     |
| name       | text        | not null       | Category name         |
| color      | text        | nullable       | Optional color for UI |
| created_at | timestamptz | default now()  | Timestamp             |

#### 3. `transactions`

| Column       | Type                                                            | Constraints         | Description                                  |
| ------------ | --------------------------------------------------------------- | ------------------- | -------------------------------------------- |
| id           | uuid                                                            | pk                  | Auto-generated                               |
| user_id      | uuid                                                            | fk -> users.id      | Transaction owner                            |
| category_id  | uuid                                                            | fk -> categories.id | Related category                             |
| type         | enum('income', 'expense')                                       | not null            | Transaction type                             |
| amount       | decimal(10,2)                                                   | check > 0           | Amount must be positive                      |
| method       | enum('Cash', 'Gcash', 'Seabank', 'UBP', 'Other Bank', 'Others') | not null            | Payment method                               |
| notes        | text                                                            | nullable            | Optional note                                |
| date         | date                                                            | not null            | Date of transaction                          |
| is_planned   | boolean                                                         | default false       | If planned, appears in budget view           |
| is_completed | boolean                                                         | default false       | When completed, it moves to transaction list |
| created_at   | timestamptz                                                     | default now()       | Timestamp                                    |

---

## Authentication Logic

* Users authenticate using their **unique `userCode`**.
* Supabase stores hashed `userCode` similar to a password.
* Session persists until **end of day (23:59)** via JWT with daily expiry.
* Login screen: user enters `userCode` → app validates via Supabase RPC function `verify_user_code(userCode)`.

**RPC Function Example:**

```sql
create or replace function verify_user_code(code text)
returns users as $$
  select * from users where userCode = code;
$$ language sql security definer;
```

---

## Business Logic

### Transactions

* On blur: auto-save draft transaction.
* Optimistic update: transaction shows instantly in dashboard header.
* Supabase updates occur asynchronously.
* Recharts visualizations auto-refresh via subscription.

### Planned Transactions

* `is_planned = true` by default.
* Once marked as `is_completed = true`, the record:

  * Updates dashboard totals.
  * Appears in both **Transactions List** and **Budget Page**.

### Filtering

* Supabase queries accept filters for:

  * Date range (`gte` / `lte`)
  * Transaction type (`income` / `expense`)
  * Category

### Pagination

* Implemented with `range()` queries in Supabase (limit 20 per page).

---

## Folder Structure (Backend-Oriented)

```
/project-root
├── src/
│   ├── lib/
│   │   ├── supabaseClient.ts        # Supabase init
│   │   ├── auth.ts                  # Custom userCode auth handler
│   │   ├── api.ts                   # Reusable data fetching utils
│   │   └── schema.ts                # Type definitions for tables
│   ├── server/
│   │   ├── transactions.ts          # CRUD operations & projections
│   │   ├── users.ts                 # Authentication / session logic
│   │   ├── categories.ts            # Category CRUD
│   │   └── analytics.ts             # Aggregates for dashboard (totals, charts)
│   └── types/
│       └── dbTypes.ts               # Generated types from Supabase schema
├── supabase/
│   ├── migrations/                  # Auto-generated migrations
│   └── seed.sql                     # Default payment methods & sample data
└── package.json
```

---

## Performance Considerations

* **Optimistic UI** → immediate feedback before DB confirmation.
* **Lazy loading** → load paginated data progressively.
* **Realtime subscription** → reflect external updates (planned → completed).
* **No local caching** → rely on Supabase client for temporary state.

---

## Security & Validation

* `userCode` treated as password → never stored in plain text.
* Input sanitization enforced on frontend and via Supabase RLS.
* Row-Level Security (RLS) ensures users can only access their own data.

**Example Policy:**

```sql
create policy "Users can access own transactions" on transactions
  for all
  using (auth.uid() = user_id);
```
