import { useCallback, useEffect, useState } from "react";
import { getQuotes } from "../api/finnhub";

/**
 * Fetches live quotes for a list of stock symbols.
 * Handles loading / error state and exposes a manual refetch.
 *
 * @param {string[]} symbols
 * @param {{ pollMs?: number }} [options] - optional auto-refresh interval
 */
export function useMarketQuotes(symbols, { pollMs } = {}) {
  const [data, setData] = useState([]);
  const [partialErrors, setPartialErrors] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState(null);
  const symbolsKey = symbols.join(",");

  const fetchQuotes = useCallback(async () => {
    setStatus((prev) => (prev === "success" ? "success" : "loading"));
    try {
      const { quotes, errors } = await getQuotes(symbols);

      if (quotes.length === 0) {
        // every symbol failed - treat as a hard error
        setStatus("error");
        setErrorMessage(errors[0]?.message ?? "Unable to load market data.");
        return;
      }

      setData(quotes);
      setPartialErrors(errors);
      setStatus("success");
      setErrorMessage(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message ?? "Unable to load market data.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey]);

  useEffect(() => {
    fetchQuotes();

    if (!pollMs) return undefined;
    const id = setInterval(fetchQuotes, pollMs);
    return () => clearInterval(id);
  }, [fetchQuotes, pollMs]);

  return {
    data,
    partialErrors,
    isLoading: status === "loading",
    isError: status === "error",
    errorMessage,
    refetch: fetchQuotes,
  };
}
