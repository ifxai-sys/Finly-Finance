/**
 * Base URL of the FastAPI backend (see /backend). Override via .env:
 *   VITE_API_BASE_URL=http://localhost:8000
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const AUTH_API_BASE_URL = `${API_BASE_URL}/api/auth`;
export const EXPENSES_API_BASE_URL = `${API_BASE_URL}/api/expenses`;
export const GOALS_API_BASE_URL = `${API_BASE_URL}/api/goals`;

/**
 * ── BACKEND PROXY SWITCH ──────────────────────────────────────────────
 * The currency and crypto widgets can either call Frankfurter and CoinGecko
 * directly from the browser, or go through the FastAPI backend's proxy
 * routes (app/routers/market.py) for caching / rate-limit protection.
 * Nothing in api/currency.js, api/crypto.js, or the widgets needs to change
 * either way, since the backend mirrors the exact upstream response shape.
 * ────────────────────────────────────────────────────────────────────── */
export const USE_BACKEND_PROXY = true;

export const CURRENCY_API_BASE_URL = USE_BACKEND_PROXY
  ? `${API_BASE_URL}/api/currency`
  : "https://open.er-api.com/v6";

// Frankfurter is only used for the small trend sparkline (history). It has
// a narrower currency list than the "latest rates" source above, so some
// pairs simply won't show a sparkline — the conversion itself still works.
export const CURRENCY_HISTORY_API_BASE_URL = USE_BACKEND_PROXY
  ? `${API_BASE_URL}/api/currency/history`
  : "https://api.frankfurter.dev/v1";

export const CRYPTO_API_BASE_URL = USE_BACKEND_PROXY
  ? `${API_BASE_URL}/api/crypto`
  : "https://api.coingecko.com/api/v3";

// Stock quotes (Finnhub) always go through the backend — Finnhub doesn't
// allow browser-side CORS requests with a key, so unlike the two proxies
// above this one isn't optional. The key itself lives in backend/.env.
export const MARKET_API_BASE_URL = `${API_BASE_URL}/api/market`;
