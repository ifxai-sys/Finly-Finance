# Finance Tracker API (FastAPI + PostgreSQL)

JWT-auth backend for the finance-tracker React app. Matches this architecture:

```
React Frontend
      │
      ├── Login API      →  /api/auth/*
      ├── Expense API     →  /api/expenses/*, /api/goals/*
      └── Crypto/Currency →  /api/crypto/*, /api/currency/*  (proxied)
                     │
              FastAPI Backend
             ┌───────┴────────┐
             ▼                ▼
        PostgreSQL       Public APIs (CoinGecko, Frankfurter)
```

## Auth model

- Passwords are hashed with bcrypt, never stored in plain text.
- On login/signup the API returns a signed JWT (`access_token`). The frontend
  stores it in `localStorage` (as you asked for — client-side storage, no
  server session/cookies) and sends it back as `Authorization: Bearer <token>`
  on every request. Tokens expire after `JWT_EXPIRES_MINUTES` (default 7 days).
- There is no refresh-token flow. When a token expires, `/api/auth/me` (and
  every other protected route) returns `401` and the frontend logs the user
  out. This is intentionally simple — see "Next steps" below for a
  production-grade refresh-token setup.

## Quick start (Docker — easiest)

```bash
cd backend
cp .env.example .env        # edit JWT_SECRET_KEY at minimum
docker compose up --build
```

API is now on `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`.

## Quick start (without Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Point DATABASE_URL at a Postgres instance you already have running, e.g.:
#   createdb finance_tracker
cp .env.example .env         # edit DATABASE_URL and JWT_SECRET_KEY

uvicorn app.main:app --reload --port 8000
```

Tables are created automatically on first startup via `Base.metadata.create_all`.

## Endpoints

| Method | Path                          | Auth | Description |
|--------|-------------------------------|------|--------------|
| POST   | `/api/auth/signup`            | –    | Create account, returns JWT + user |
| POST   | `/api/auth/login`             | –    | Returns JWT + user |
| GET    | `/api/auth/me`                | ✓    | Current user |
| GET    | `/api/expenses/dashboard?month=YYYY-MM` | ✓ | Everything the Dashboard page needs in one call |
| GET/POST | `/api/expenses/transactions` | ✓  | List / create transactions |
| PATCH/DELETE | `/api/expenses/transactions/{id}` | ✓ | Update / delete a transaction |
| GET/POST | `/api/expenses/budgets`     | ✓  | List (with computed spend %) / create budget categories |
| DELETE | `/api/expenses/budgets/{id}`  | ✓    | Delete a budget category |
| GET/POST/PATCH/DELETE | `/api/goals` | ✓ | Savings goals CRUD |
| GET    | `/api/crypto/coins/markets`   | –    | Proxies CoinGecko, same shape as calling it directly |
| GET    | `/api/currency/latest`, `/api/currency/{start}..{end}` | – | Proxies Frankfurter |

New signups are seeded with 4 default budget categories and 3 default savings
goals (all at $0 spent) so the dashboard isn't empty — see `app/seed_data.py`.

## Auth: signup verification & password reset (OTP)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | – | Creates an unverified user, emails a 6-digit OTP |
| POST | `/api/auth/verify-signup-otp` | – | Verifies the OTP, marks the account verified, returns a JWT |
| POST | `/api/auth/resend-otp` | – | Sends a fresh signup OTP |
| POST | `/api/auth/login` | – | Blocks with 403 until the account is verified |
| POST | `/api/auth/forgot-password` | – | Emails a 6-digit OTP if the (verified) account exists |
| POST | `/api/auth/reset-password` | – | Verifies the OTP + sets a new password |

OTP codes are 6 digits, expire after `OTP_EXPIRE_MINUTES` (default 10), and
are single-use — see `app/otp.py` and the `otp_codes` table in `app/models.py`.

### Gmail OTP setup

OTP emails are sent through the **Gmail API over HTTPS** (not SMTP), because
Render's free tier blocks outbound SMTP ports — this way works there too.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create a
   project (or reuse one) → **APIs & Services → Library** → enable the
   **Gmail API**.
2. **APIs & Services → OAuth consent screen** → set it up as **External**,
   add your Gmail address as a test user.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   → type **Desktop app**. Copy the **Client ID** and **Client Secret**.
4. Get a refresh token once, locally, using [Google's OAuth Playground](https://developers.google.com/oauthplayground):
   - Click the gear icon (top right) → check **"Use your own OAuth
     credentials"** → paste your Client ID/Secret.
   - In the left panel, find **Gmail API v1** → select scope
     `https://www.googleapis.com/auth/gmail.send`.
   - Click **Authorize APIs**, sign in with the Gmail account you want to
     send from, then click **Exchange authorization code for tokens**.
   - Copy the **Refresh token** shown.
5. Fill in `backend/.env`:
   ```
   GMAIL_CLIENT_ID=...
   GMAIL_CLIENT_SECRET=...
   GMAIL_REFRESH_TOKEN=...
   GMAIL_SENDER_EMAIL=your_gmail_address@gmail.com
   ```

Until these are set, signup/forgot-password calls will fail with a clear
502 error telling you Gmail isn't configured yet — nothing fails silently.

## Next steps for production

- Replace `Base.metadata.create_all` with **Alembic** migrations.
- Add a refresh-token / rotation flow if you want sessions longer than
  `JWT_EXPIRES_MINUTES` without re-login.
- Rate-limit `/api/auth/login` (e.g. `slowapi`) to slow down brute force.
- Put a real cache (Redis) in front of `app/routers/market.py` instead of the
  in-memory dict, if you deploy more than one API instance.
