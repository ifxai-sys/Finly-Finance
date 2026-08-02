import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AddGoalModal from "../components/dashboard/AddGoalModal";
import AddFundsModal from "../components/dashboard/AddFundsModal";
import { iconFor } from "../components/dashboard/iconMap";
import { createGoal, deleteGoal, fetchGoals, updateGoal } from "../api/goals";
import { formatPKR } from "../utils/currency";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [fundsGoal, setFundsGoal] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setGoals(await fetchGoals());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(goal) {
    await createGoal(goal);
    await load();
  }

  async function handleAddFunds(goal, amount) {
    setBusyId(goal.id);
    try {
      await updateGoal(goal.id, { saved_amount: goal.saved_amount + amount });
      await load();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this savings goal?")) return;
    setBusyId(id);
    try {
      await deleteGoal(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardLayout title="Savings Goals" subtitle="Set a target, chip away at it, and watch the progress bar move.">
      <div className="rounded-2xl bg-paper p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink">All Goals</h3>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper transition hover:bg-forest-deep"
          >
            <Plus size={15} /> Create Goal
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-coral">Couldn't load goals: {error}</p>}
        {isLoading && <p className="mt-6 text-sm text-ink/45">Loading…</p>}
        {!isLoading && goals.length === 0 && (
          <p className="mt-6 text-sm text-ink/45">No savings goals yet — create your first one.</p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {goals.map((g) => {
            const Icon = iconFor(g.icon);
            const busy = busyId === g.id;
            return (
              <div key={g.id} className="rounded-xl border border-ink/8 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-amber-tint text-amber">
                    <Icon size={15} />
                  </span>
                  <div className="flex flex-1 items-center justify-between text-sm">
                    <span className="font-medium text-ink">{g.title}</span>
                    <span className="font-semibold text-ink">{g.pct}%</span>
                  </div>
                  <button
                    onClick={() => handleDelete(g.id)}
                    disabled={busy}
                    className="flex-none rounded-full p-2 text-ink/35 transition hover:bg-coral-tint hover:text-coral disabled:opacity-50"
                    aria-label="Delete goal"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-cream-deep">
                  <div className="h-1.5 rounded-full bg-forest" style={{ width: `${g.pct}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-ink/45">
                    {formatPKR(g.saved_amount)} / {formatPKR(g.target_amount)}
                  </p>
                  <button
                    onClick={() => setFundsGoal(g)}
                    disabled={busy}
                    className="rounded-full border border-ink/12 px-3 py-1 text-xs font-medium text-ink/70 transition hover:bg-cream-deep disabled:opacity-50"
                  >
                    + Add funds
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddGoalModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
      <AddFundsModal
        open={!!fundsGoal}
        goal={fundsGoal}
        onClose={() => setFundsGoal(null)}
        onSubmit={handleAddFunds}
      />
    </DashboardLayout>
  );
}
