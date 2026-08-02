import { EXPENSES_API_BASE_URL } from "../config/apiConfig";
import { apiRequest } from "./client";

/**
 * Everything the Dashboard page needs, aggregated server-side in one call:
 * stats, spending overview, income/expenses chart, recent transactions,
 * budget summary, and savings goals. Pass `month` as "YYYY-MM" to look at
 * a different month; defaults to the current one.
 */
export async function fetchDashboard(month) {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  return apiRequest(`${EXPENSES_API_BASE_URL}/dashboard${query}`);
}

export async function fetchTransactions({ limit = 100, type, category } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (type) params.set("type", type);
  if (category) params.set("category", category);
  return apiRequest(`${EXPENSES_API_BASE_URL}/transactions?${params.toString()}`);
}

export async function createTransaction(transaction) {
  return apiRequest(`${EXPENSES_API_BASE_URL}/transactions`, {
    method: "POST",
    body: transaction,
  });
}

export async function updateTransaction(id, changes) {
  return apiRequest(`${EXPENSES_API_BASE_URL}/transactions/${id}`, {
    method: "PATCH",
    body: changes,
  });
}

export async function deleteTransaction(id) {
  return apiRequest(`${EXPENSES_API_BASE_URL}/transactions/${id}`, { method: "DELETE" });
}

export async function fetchBudgets(month) {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  return apiRequest(`${EXPENSES_API_BASE_URL}/budgets${query}`);
}

export async function createBudget(budget) {
  return apiRequest(`${EXPENSES_API_BASE_URL}/budgets`, { method: "POST", body: budget });
}

export async function deleteBudget(id) {
  return apiRequest(`${EXPENSES_API_BASE_URL}/budgets/${id}`, { method: "DELETE" });
}
