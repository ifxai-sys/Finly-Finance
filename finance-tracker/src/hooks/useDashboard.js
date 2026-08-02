import { useCallback, useEffect, useState } from "react";
import { createTransaction, fetchDashboard } from "../api/expenses";

export function useDashboard(month) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDashboard(month);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const addTransaction = useCallback(
    async (transaction) => {
      await createTransaction(transaction);
      await load(); // keep it simple: refetch the aggregate after every write
    },
    [load]
  );

  return { data, isLoading, error, refresh: load, addTransaction };
}
