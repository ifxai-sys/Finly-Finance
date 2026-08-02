/**
 * Central currency formatting for the app. All budget / transaction / goal
 * amounts are stored as plain numbers and rendered in PKR (Pakistani Rupee).
 *
 * NOTE: Live market data (stocks via Finnhub, crypto via CoinGecko) is left
 * in USD in MarketSnapshot / CryptoSnapshot, since that's the currency those
 * upstream APIs quote in — converting it would require running every quote
 * through the live USD→PKR exchange rate on every render/poll. The
 * CurrencyConverter widget already lets a user convert those into PKR
 * on demand.
 */

const formatter = (decimals) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/**
 * Formats a number as PKR, e.g. formatPKR(125000) -> "Rs 125,000"
 * @param {number} amount
 * @param {{ decimals?: number }} [opts]
 */
export function formatPKR(amount, { decimals = 0 } = {}) {
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return formatter(decimals).format(value);
}

/** Formats a signed amount, e.g. formatSignedPKR(-500) -> "-Rs 500" */
export function formatSignedPKR(amount, { decimals = 2 } = {}) {
  const value = Number(amount) || 0;
  const sign = value < 0 ? "-" : "+";
  return `${sign}${formatPKR(Math.abs(value), { decimals })}`;
}

/** Compact form for chart axes, e.g. formatCompactPKR(125000) -> "Rs 125K" */
export function formatCompactPKR(amount) {
  const value = Number(amount) || 0;
  if (Math.abs(value) >= 1_000_000) return `Rs ${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `Rs ${(value / 1_000).toFixed(0)}K`;
  return `Rs ${value.toFixed(0)}`;
}
