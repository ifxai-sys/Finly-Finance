import { GOALS_API_BASE_URL } from "../config/apiConfig";
import { apiRequest } from "./client";

export async function fetchGoals() {
  return apiRequest(GOALS_API_BASE_URL);
}

export async function createGoal(goal) {
  return apiRequest(GOALS_API_BASE_URL, { method: "POST", body: goal });
}

export async function updateGoal(id, changes) {
  return apiRequest(`${GOALS_API_BASE_URL}/${id}`, { method: "PATCH", body: changes });
}

export async function deleteGoal(id) {
  return apiRequest(`${GOALS_API_BASE_URL}/${id}`, { method: "DELETE" });
}
