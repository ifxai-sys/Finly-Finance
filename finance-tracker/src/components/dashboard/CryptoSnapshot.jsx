import { Bitcoin, AlertTriangle, RefreshCw } from "lucide-react";
import { useCryptoPrices } from "../../hooks/useCryptoPrices";
import { useExchangeRates } from "../../hooks/useExchangeRates";
import { formatPKR } from "../../utils/currency";
import Sparkline from "./Sparkline";

const COIN_IDS = ["bitcoin", "ethereum", "solana", "ripple", "cardano", "dogecoin"];

function formatUsd(price) {
  if (price == null) return "—";
  const decimals = price < 1 ? 4 : 2;
  return price.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function CryptoSnapshot() {
  const { data, missing, isLoading, isError, errorMessage, refetch } = useCryptoPrices(COIN_IDS, {
    pollMs: 60_000,
  });

  // CoinGecko quotes crypto in USD — convert to PKR so amounts on this page
  // read consistently with the rest of the app.
  const { rates: usdRates } = useExchangeRates("USD", ["PKR"], { pollMs: 60_000 });
  const usdToPkr = usdRates?.PKR;

  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-tint text-amber">
            <Bitcoin size={16} />
          </span>
          <div>
            <h3 className="font-semibold text-ink">Crypto Snapshot</h3>
            <p className="text-xs text-ink/40">Live prices via CoinGecko, converted to PKR</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-medium text-ink/55 transition hover:border-ink/25 hover:text-ink disabled:opacity-50"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Loading state */}
      {isLoading && data.length === 0 && (
        <ul className="mt-5 space-y-3" aria-label="Loading crypto prices">
          {COIN_IDS.map((id) => (
            <li key={id} className="flex items-center justify-between">
              <div className="h-3.5 w-16 animate-pulse rounded bg-cream-deep" />
              <div className="h-6 w-16 animate-pulse rounded bg-cream-deep" />
              <div className="h-3.5 w-20 animate-pulse rounded bg-cream-deep" />
            </li>
          ))}
        </ul>
      )}

      {/* Hard error state */}
      {isError && (
        <div className="mt-5 flex flex-col items-start gap-3 rounded-xl bg-coral-tint p-4 text-sm text-coral">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-none" />
            <p>{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full bg-coral px-4 py-1.5 text-xs font-medium text-paper transition hover:opacity-90"
          >
            Try again
          </button>
        </div>
      )}

      {/* Success state */}
      {!isError && data.length > 0 && (
        <ul className="mt-5 space-y-3.5">
          {data.map((c) => {
            const up = c.change24h >= 0;
            const priceInPkr = usdToPkr != null && c.price != null ? c.price * usdToPkr : null;
            return (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink/80">{c.symbol}</span>

                {c.sparkline.length > 1 && (
                  <Sparkline
                    data={c.sparkline}
                    width={64}
                    height={24}
                    stroke={up ? "#3F6B4B" : "#D9564C"}
                    strokeWidth={1.5}
                  />
                )}

                <span className="flex items-center gap-2">
                  <span className="text-right">
                    <span className="block text-ink">
                      {priceInPkr != null ? formatPKR(priceInPkr, { decimals: 0 }) : "—"}
                    </span>
                    <span className="block text-[10px] text-ink/35">${formatUsd(c.price)}</span>
                  </span>
                  <span className={up ? "text-moss" : "text-coral"}>
                    {up ? "▲" : "▼"} {Math.abs(c.change24h).toFixed(2)}%
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Partial errors */}
      {missing.length > 0 && (
        <p className="mt-4 text-xs text-amber">
          Couldn't load {missing.join(", ")} — showing the rest.
        </p>
      )}
    </div>
  );
}
