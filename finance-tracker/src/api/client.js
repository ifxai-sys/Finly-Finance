const TOKEN_KEY = "finance-tracker:token";

/**
 * ── JWT STORAGE ───────────────────────────────────────────────────────
 * The backend returns a signed JWT on login/signup. We keep it in
 * localStorage (client-side, as requested) and attach it as
 * `Authorization: Bearer <token>` on every request below. There's no
 * server session — whoever holds the token is treated as that user until
 * it expires (see backend/.env JWT_EXPIRES_MINUTES).
 * ────────────────────────────────────────────────────────────────────── */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** Thrown on 401 so callers (AuthContext) can log the user out. */
export class UnauthorizedError extends Error {}

export async function apiRequest(url, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Couldn't reach the API. Is the FastAPI backend running (see backend/README.md)?"
    );
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no JSON body (e.g. some error responses) — leave data as null
  }

  if (res.status === 401) {
    throw new UnauthorizedError(data?.detail || "Your session has expired. Please log in again.");
  }

  if (!res.ok) {
    const message =
      (Array.isArray(data?.detail) && data.detail[0]?.msg) ||
      data?.detail ||
      `Request failed (${res.status}).`;
    throw new Error(message);
  }

  return data;
}
