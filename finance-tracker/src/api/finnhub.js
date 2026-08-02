import { MARKET_API_BASE_URL } from "../config/apiConfig";

/**
 * Fetches a real-time quote for a single stock symbol via the FastAPI
 * backend's Finnhub proxy (see backend/app/routers/market.py). Going
 * through the backend means the Finnhub API key only ever lives in
 * backend/.env, never in the browser bundle.
 *
 * Response shape (unchanged from Finnhub): { c: currentPrice, d: change,
 * dp: percentChange, h: highToday, l: lowToday, o: openToday, pc: previousClose }
 */
export async function getQuote(symbol) {
  const url = `${MARKET_API_BASE_URL}/quote/${encodeURIComponent(symbol)}`;
  const res = await fetch(url);

  if (!res.ok) {
    let detail;
    try {
      detail = (await res.json()).detail;
    } catch {
      // ignore — fall through to the generic message below
    }
    if (res.status === 503) {
      throw new Error(detail || "Stock quotes aren't configured yet.");
    }
    if (res.status === 401) {
      throw new Error("Invalid Finnhub API key. Check backend/.env.");
    }
    if (res.status === 429) {
      throw new Error("Finnhub rate limit hit. Please wait a moment and retry.");
    }
    throw new Error(detail || `Finnhub request failed (${res.status}).`);
  }

  const data = await res.json();

  // Finnhub returns all-zero fields for an unknown/unsupported symbol
  // instead of an HTTP error, so we surface that as an error too.
  if (data.c === 0 && data.pc === 0) {
    throw new Error(`No quote data found for "${symbol}".`);
  }

  return {
    symbol,
    price: data.c,
    change: data.d,
    percentChange: data.dp,
    high: data.h,
    low: data.l,
    open: data.o,
    previousClose: data.pc,
  };
}

/**
 * Fetches quotes for multiple symbols in parallel.
 * Uses allSettled so one bad symbol doesn't fail the whole batch.
 */
export async function getQuotes(symbols) {
  const results = await Promise.allSettled(symbols.map(getQuote));

  const quotes = [];
  const errors = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      quotes.push(result.value);
    } else {
      errors.push({ symbol: symbols[i], message: result.reason.message });
    }
  });

  return { quotes, errors };
}
