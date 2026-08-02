# Finance Tracker — Full Stack

```
React Frontend (finance-tracker/)
      │
      ├── Login API      →  /api/auth/*
      ├── Expense API     →  /api/expenses/*, /api/goals/*
      └── Crypto/Currency →  /api/crypto/*, /api/currency/*
                     │
              FastAPI Backend (backend/)
             ┌───────┴────────┐
             ▼                ▼
        PostgreSQL       Public APIs (CoinGecko, Frankfurter)
```

- **`backend/`** — FastAPI + SQLAlchemy + PostgreSQL, JWT auth. See `backend/README.md` for full details on running it (Docker or local).
- **`finance-tracker/`** — the React/Vite app. Now talks to the backend instead of using mocked data and localStorage-only auth.

## Run everything locally

**1. Start the backend + database**

```bash
cd backend
cp .env.example .env   # set JWT_SECRET_KEY to something random
docker compose up --build
```

This starts Postgres on `5432` and the API on `http://localhost:8000`
(docs at `http://localhost:8000/docs`).

**2. Start the frontend**

```bash
cd finance-tracker
cp .env.example .env    # VITE_API_BASE_URL defaults to http://localhost:8000
npm install
npm run dev
```

Open the printed local URL, sign up for an account, and the dashboard will
be driven entirely by real data in Postgres — add a transaction and watch
the stats, chart, and spending breakdown update.

## What changed from the original template

- `src/context/AuthContext.jsx` now calls the real `/api/auth/*` endpoints
  and stores the returned JWT in `localStorage` (via `src/api/client.js`)
  instead of faking a login after a timeout.
- `src/config/apiConfig.js` has `USE_BACKEND_PROXY` flipped on, so the
  crypto/currency widgets route through the FastAPI backend instead of
  calling CoinGecko/Frankfurter directly from the browser.
- All the previously hardcoded dashboard widgets (`StatRow`,
  `SpendingOverview`, `IncomeExpensesChart`, `RecentTransactions`,
  `BudgetSummary`, `SavingsGoals`) now receive their data as props from
  `src/hooks/useDashboard.js`, which calls the backend's single aggregate
  `/api/expenses/dashboard` endpoint.
- A new "Add" button on Recent Transactions opens
  `AddTransactionModal.jsx`, which posts to `/api/expenses/transactions`
  and refreshes the dashboard.
- "Create New Goal" now actually creates a row via `/api/goals` (simple
  prompt-based form — swap for a proper modal whenever you'd like).

## Notes / things you'll likely want to change next

- The JWT has no refresh flow — it just expires after `JWT_EXPIRES_MINUTES`
  (7 days by default) and the user is logged out. Fine for a personal
  project; add refresh tokens if you need long-lived sessions without
  friction.
- `Base.metadata.create_all` creates tables automatically on startup —
  swap for Alembic migrations before this touches real user data you care
  about keeping.
- CORS is locked to `http://localhost:5173` by default (`backend/.env`
  `CORS_ORIGINS`) — update it when you deploy the frontend somewhere else.
