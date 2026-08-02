import { useCallback, useEffect, useState } from "react";
import { getRateHistory } from "../api/currency";

/**
 * Fetches the last N days of rate history for a single currency pair.
 * Handles loading / error state and exposes a manual refetch.
 *
 * @param {string} base - e.g. "USD"
 * @param {string} symbol - e.g. "EUR"
 * @param {{ days?: number }} [options]
 */
export function useRateHistory(base, symbol, { days = 7 } = {}) {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchHistory = useCallback(async () => {
    setStatus((prev) => (prev === "success" ? "success" : "loading"));
    try {
      const points = await getRateHistory(base, symbol, days);
      setHistory(points);
      setStatus("success");
      setErrorMessage(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message ?? "Unable to load rate history.");
    }
  }, [base, symbol, days]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading: status === "loading",
    isError: status === "error",
    errorMessage,
    refetch: fetchHistory,
  };
}
