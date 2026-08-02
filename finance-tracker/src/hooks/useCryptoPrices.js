import { useCallback, useEffect, useState } from "react";
import { getCryptoMarkets } from "../api/crypto";

/**
 * Fetches live crypto market data for a list of coin ids.
 * Handles loading / error state and exposes a manual refetch.
 *
 * @param {string[]} ids - CoinGecko coin ids, e.g. ["bitcoin", "ethereum"]
 * @param {{ vsCurrency?: string, pollMs?: number }} [options]
 */
export function useCryptoPrices(ids, { vsCurrency = "usd", pollMs } = {}) {
  const [data, setData] = useState([]);
  const [missing, setMissing] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState(null);
  const idsKey = ids.join(",");

  const fetchPrices = useCallback(async () => {
    setStatus((prev) => (prev === "success" ? "success" : "loading"));
    try {
      const { coins, missing } = await getCryptoMarkets(ids, vsCurrency);
      setData(coins);
      setMissing(missing);
      setStatus("success");
      setErrorMessage(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message ?? "Unable to load crypto prices.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, vsCurrency]);

  useEffect(() => {
    fetchPrices();

    if (!pollMs) return undefined;
    const id = setInterval(fetchPrices, pollMs);
    return () => clearInterval(id);
  }, [fetchPrices, pollMs]);

  return {
    data,
    missing,
    isLoading: status === "loading",
    isError: status === "error",
    errorMessage,
    refetch: fetchPrices,
  };
}
