import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AddBudgetModal from "../components/dashboard/AddBudgetModal";
import { iconFor } from "../components/dashboard/iconMap";
import { createBudget, deleteBudget, fetchBudgets } from "../api/expenses";
import { formatPKR } from "../utils/currency";

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setBudgets(await fetchBudgets());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(budget) {
    await createBudget(budget);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this budget category?")) return;
    setDeletingId(id);
    try {
      await deleteBudget(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalLimit = budgets.reduce((sum, b) => sum + b.monthly_limit, 0);

  return (
    <DashboardLayout title="Budget" subtitle="Track spending against a monthly limit, category by category.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-paper p-5 shadow-sm">
          <p className="text-sm text-ink/55">Total Budgeted</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {formatPKR(totalLimit)}
          </p>
        </div>
        <div className="rounded-2xl bg-paper p-5 shadow-sm">
          <p className="text-sm text-ink/55">Total Spent This Month</p>
          <p className={`mt-2 font-display text-2xl font-semibold ${totalSpent > totalLimit ? "text-coral" : "text-ink"}`}>
            {formatPKR(totalSpent)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-paper p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink">Budget Categories</h3>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper transition hover:bg-forest-deep"
          >
            <Plus size={15} /> Add Category
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-coral">Couldn't load budgets: {error}</p>}
        {isLoading && <p className="mt-6 text-sm text-ink/45">Loading…</p>}
        {!isLoading && budgets.length === 0 && (
          <p className="mt-6 text-sm text-ink/45">No budget categories yet — add your first one.</p>
        )}

        <ul className="mt-5 space-y-6">
          {budgets.map((b) => {
            const Icon = iconFor(b.icon);
            const overBudget = b.pct > 100;
            return (
              <li key={b.id}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-sage text-moss">
                    <Icon size={15} />
                  </span>
                  <div className="flex flex-1 items-center justify-between text-sm">
                    <span className="font-medium text-ink">{b.category}</span>
                    <span className="text-ink/50">
                      {formatPKR(b.spent)} / {formatPKR(b.monthly_limit)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(b.id)}
                    disabled={deletingId === b.id}
                    className="flex-none rounded-full p-2 text-ink/35 transition hover:bg-coral-tint hover:text-coral disabled:opacity-50"
                    aria-label="Delete budget"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-cream-deep">
                    <div
                      className={`h-1.5 rounded-full ${overBudget ? "bg-coral" : "bg-forest"}`}
                      style={{ width: `${Math.min(b.pct, 100)}%` }}
                    />
                  </div>
                  <span className={`w-9 text-right text-xs ${overBudget ? "text-coral" : "text-ink/45"}`}>
                    {b.pct}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <AddBudgetModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
    </DashboardLayout>
  );
}
