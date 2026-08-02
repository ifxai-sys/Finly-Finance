import { useState } from "react";
import { ArrowLeftRight, AlertTriangle, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useExchangeRates } from "../../hooks/useExchangeRates";
import { useRateHistory } from "../../hooks/useRateHistory";
import Sparkline from "./Sparkline";

// Rates come from ExchangeRate-API's open-access endpoint (~160 currencies,
// includes PKR/AED/SAR). The 7-day trend sparkline below uses Frankfurter/ECB
// separately, which has a narrower list — a pair like USD→PKR will still
// convert correctly, it just won't show a trend sparkline.
const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "AED", "SAR", "JPY", "CAD", "AUD", "CHF", "INR", "CNY"];

export default function CurrencyConverter() {
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("PKR");

  const { rates, isLoading, isError, errorMessage, refetch } = useExchangeRates(
    from,
    CURRENCIES,
    { pollMs: 60_000 }
  );

  const { history, isLoading: historyLoading } = useRateHistory(from, to, { days: 7 });

  const rate = rates?.[to];
  const converted = rate != null ? amount * rate : null;

  const trendValues = history.map((p) => p.rate);
  const trendUp = trendValues.length > 1 && trendValues.at(-1) >= trendValues[0];
  const trendPercent =
    trendValues.length > 1
      ? ((trendValues.at(-1) - trendValues[0]) / trendValues[0]) * 100
      : null;

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-moss">
            <ArrowLeftRight size={16} />
          </span>
          <div>
            <h3 className="font-semibold text-ink">Currency Converter</h3>
            <p className="text-xs text-ink/40">Live rates, 160+ currencies</p>
          </div>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-medium text-ink/55 transition hover:border-ink/25 hover:text-ink disabled:opacity-50"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <label htmlFor="amount" className="text-xs font-medium text-ink/50">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={swap}
            aria-label="Swap currencies"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-ink/10 text-ink/50 transition hover:border-ink/25 hover:text-ink"
          >
            <ArrowLeftRight size={14} />
          </button>

          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && !rates && (
        <div className="mt-5 h-14 animate-pulse rounded-xl bg-cream-deep" />
      )}

      {/* Error state */}
      {isError && (
        <div className="mt-5 flex flex-col items-start gap-3 rounded-xl bg-coral-tint p-4 text-sm text-coral">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-none" />
            <p>{errorMessage}</p>
          </div>
          <button
            onClick={refetch}
            className="rounded-full bg-coral px-4 py-1.5 text-xs font-medium text-paper transition hover:opacity-90"
          >
            Try again
          </button>
        </div>
      )}

      {/* Success state */}
      {!isError && converted != null && (
        <div className="mt-5 rounded-xl bg-sage p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-moss/70">
                {amount.toLocaleString()} {from} =
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-forest-deep">
                {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}
              </p>
              <p className="mt-1 text-xs text-moss/70">
                1 {from} = {rate.toFixed(4)} {to}
              </p>
            </div>

            {!historyLoading && trendValues.length > 1 && (
              <div className="flex flex-none flex-col items-end gap-1">
                <Sparkline
                  data={trendValues}
                  width={90}
                  height={32}
                  stroke={trendUp ? "#3F6B4B" : "#D9564C"}
                  fill
                />
                <span
                  className={`flex items-center gap-1 text-[11px] font-medium ${
                    trendUp ? "text-moss" : "text-coral"
                  }`}
                >
                  {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {Math.abs(trendPercent).toFixed(2)}% / 7d
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
