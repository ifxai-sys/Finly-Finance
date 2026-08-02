import { CURRENCY_API_BASE_URL, CURRENCY_HISTORY_API_BASE_URL } from "../config/apiConfig";

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Fetches live exchange rates for one base currency against a list of target
 * currencies, via ExchangeRate-API's free "open access" endpoint (no key
 * required, ~160 currencies incl. PKR/AED/SAR — see api docs at
 * exchangerate-api.com/docs/free). This endpoint always returns rates for
 * every currency it supports, so filtering down to `symbols` happens here.
 *
 * Raw upstream shape: { result: "success", base_code: "USD", rates: {...} }
 */
export async function getExchangeRates(base, symbols) {
  const url = `${CURRENCY_API_BASE_URL}/latest/${encodeURIComponent(base)}`;

  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Unsupported currency: "${base}".`);
    }
    if (res.status === 429) {
      throw new Error("Rate limit hit fetching exchange rates. Please wait a moment and retry.");
    }
    throw new Error(`Exchange rate request failed (${res.status}).`);
  }

  const data = await res.json();

  if (data.result !== "success") {
    throw new Error(`Unsupported currency: "${base}".`);
  }

  const rates = { [base]: 1 };
  for (const symbol of symbols) {
    if (data.rates[symbol] != null) rates[symbol] = data.rates[symbol];
  }

  return { base, date: data.time_last_update_utc, rates };
}

/**
 * Fetches the daily rate history for a single currency pair over the last N
 * days, via Frankfurter (ECB rates) — used only to draw the small trend
 * sparkline in the converter widget. Frankfurter covers a narrower set of
 * currencies (~31) than getExchangeRates() above; if either currency in the
 * pair isn't one of them this throws, and the widget just hides the
 * sparkline rather than showing an error (conversion itself is unaffected).
 */
export async function getRateHistory(base, symbol, days = 7) {
  if (base === symbol) {
    // A currency always trades 1:1 with itself — flat line, no need to call the API.
    return Array.from({ length: days + 1 }, (_, i) => ({
      date: toISODate(new Date(Date.now() - (days - i) * 86_400_000)),
      rate: 1,
    }));
  }

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  const url = `${CURRENCY_HISTORY_API_BASE_URL}/${toISODate(start)}..${toISODate(
    end
  )}?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(symbol)}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Exchange rate history request failed (${res.status}).`);
  }

  const data = await res.json();

  return Object.entries(data.rates)
    .map(([date, ratesForDate]) => ({ date, rate: ratesForDate[symbol] }))
    .filter((point) => point.rate != null)
    .sort((a, b) => a.date.localeCompare(b.date));
}
