import { TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import { useMarketQuotes } from "../../hooks/useMarketQuotes";
import { useExchangeRates } from "../../hooks/useExchangeRates";
import { formatPKR } from "../../utils/currency";

const SYMBOLS = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN"];

export default function MarketSnapshot() {
  const { data, partialErrors, isLoading, isError, errorMessage, refetch } =
    useMarketQuotes(SYMBOLS, { pollMs: 60_000 });

  // Finnhub quotes stocks in USD — convert to PKR so amounts on this page
  // read consistently with the rest of the app.
  const { rates: usdRates } = useExchangeRates("USD", ["PKR"], { pollMs: 60_000 });
  const usdToPkr = usdRates?.PKR;

  function handleRefresh() {
    refetch();
  }

  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-moss">
            <TrendingUp size={16} />
          </span>
          <div>
            <h3 className="font-semibold text-ink">Live Market Snapshot</h3>
            <p className="text-xs text-ink/40">Real-time quotes via Finnhub, converted to PKR</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-medium text-ink/55 transition hover:border-ink/25 hover:text-ink disabled:opacity-50"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Loading state */}
      {isLoading && data.length === 0 && (
        <ul className="mt-5 space-y-3" aria-label="Loading market data">
          {SYMBOLS.map((s) => (
            <li key={s} className="flex items-center justify-between">
              <div className="h-3.5 w-16 animate-pulse rounded bg-cream-deep" />
              <div className="h-3.5 w-20 animate-pulse rounded bg-cream-deep" />
            </li>
          ))}
        </ul>
      )}

      {/* Hard error state (all symbols failed, or a config error) */}
      {isError && (
        <div className="mt-5 flex flex-col items-start gap-3 rounded-xl bg-coral-tint p-4 text-sm text-coral">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-none" />
            <p>{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-full bg-coral px-4 py-1.5 text-xs font-medium text-paper transition hover:opacity-90"
          >
            Try again
          </button>
        </div>
      )}

      {/* Success state */}
      {!isError && data.length > 0 && (
        <ul className="mt-5 space-y-3">
          {data.map((q) => {
            const up = q.change >= 0;
            const priceInPkr = usdToPkr != null ? q.price * usdToPkr : null;
            return (
              <li key={q.symbol} className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink/80">{q.symbol}</span>
                <span className="flex items-center gap-2">
                  <span className="text-right">
                    <span className="block text-ink">
                      {priceInPkr != null ? formatPKR(priceInPkr, { decimals: 0 }) : "—"}
                    </span>
                    <span className="block text-[10px] text-ink/35">${q.price.toFixed(2)}</span>
                  </span>
                  <span className={up ? "text-moss" : "text-coral"}>
                    {up ? "▲" : "▼"} {Math.abs(q.percentChange).toFixed(2)}%
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Partial errors (some symbols failed, others succeeded) */}
      {partialErrors.length > 0 && (
        <p className="mt-4 text-xs text-amber">
          Couldn't load {partialErrors.map((e) => e.symbol).join(", ")} — showing the rest.
        </p>
      )}
    </div>
  );
}
