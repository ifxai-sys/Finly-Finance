import { useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { iconFor } from "./iconMap";
import { createGoal } from "../../api/goals";
import { formatPKR } from "../../utils/currency";

export default function SavingsGoals({ goals = [], isLoading, onChanged }) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  async function handleCreate() {
    const title = window.prompt("Goal name (e.g. New Car)");
    if (!title) return;
    const targetRaw = window.prompt("Target amount (PKR)");
    const target = Number(targetRaw);
    if (!target || target <= 0) {
      setError("Target amount must be a positive number.");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      await createGoal({ title, target_amount: target, saved_amount: 0, icon: "shield-check" });
      onChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ink">Savings Goals</h3>
        <Link to="/dashboard/goals" className="text-xs font-medium text-moss hover:underline">View All</Link>
      </div>

      {!isLoading && goals.length === 0 && (
        <p className="mt-5 text-sm text-ink/45">No savings goals yet — create your first one below.</p>
      )}

      <ul className="mt-5 space-y-5">
        {goals.map((g) => {
          const Icon = iconFor(g.icon);
          return (
            <li key={g.id}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-amber-tint text-amber">
                  <Icon size={15} />
                </span>
                <div className="flex flex-1 items-center justify-between text-sm">
                  <span className="font-medium text-ink">{g.title}</span>
                  <span className="font-semibold text-ink">{g.pct}%</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-cream-deep">
                <div className="h-1.5 rounded-full bg-forest" style={{ width: `${g.pct}%` }} />
              </div>
              <p className="mt-1 text-right text-xs text-ink/45">
                {formatPKR(g.saved_amount)} / {formatPKR(g.target_amount)}
              </p>
            </li>
          );
        })}
      </ul>

      {error && <p className="mt-3 text-xs text-coral">{error}</p>}

      <button
        onClick={handleCreate}
        disabled={creating}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep disabled:opacity-60"
      >
        <Plus size={16} /> {creating ? "Creating…" : "Create New Goal"}
      </button>
    </div>
  );
}
