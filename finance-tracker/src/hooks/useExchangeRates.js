import { useCallback, useEffect, useState } from "react";
import { getExchangeRates } from "../api/currency";

/**
 * Fetches live exchange rates for a base currency against a list of target currencies.
 * Handles loading / error state and exposes a manual refetch.
 *
 * @param {string} base - e.g. "USD"
 * @param {string[]} symbols - e.g. ["EUR", "GBP", "PKR"]
 * @param {{ pollMs?: number }} [options]
 */
export function useExchangeRates(base, symbols, { pollMs } = {}) {
  const [rates, setRates] = useState(null);
  const [date, setDate] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState(null);
  const symbolsKey = symbols.join(",");

  const fetchRates = useCallback(async () => {
    setStatus((prev) => (prev === "success" ? "success" : "loading"));
    try {
      const result = await getExchangeRates(base, symbols);
      setRates(result.rates);
      setDate(result.date);
      setStatus("success");
      setErrorMessage(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message ?? "Unable to load exchange rates.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, symbolsKey]);

  useEffect(() => {
    fetchRates();

    if (!pollMs) return undefined;
    const id = setInterval(fetchRates, pollMs);
    return () => clearInterval(id);
  }, [fetchRates, pollMs]);

  return {
    rates,
    date,
    isLoading: status === "loading",
    isError: status === "error",
    errorMessage,
    refetch: fetchRates,
  };
}
