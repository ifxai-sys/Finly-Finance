import { useState } from "react";
import { X } from "lucide-react";
import { formatPKR } from "../../utils/currency";

// Replaces the window.prompt("Add how much...") call that used to live in
// GoalsPage.handleAddFunds. A real modal lets us validate the input, show
// errors inline, and communicate progress while the request is in flight —
// instead of a jarring native browser dialog that breaks the app's look.
export default function AddFundsModal({ open, onClose, goal, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open || !goal) return null;

  const remaining = Math.max(goal.target_amount - goal.saved_amount, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Enter a valid positive amount.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(goal, value);
      setAmount("");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setAmount("");
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Add Funds</h3>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-ink/45 hover:bg-cream hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-2 text-sm text-ink/55">{goal.title}</p>

        <div className="mt-3 rounded-xl bg-sage px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-moss/75">Saved</span>
            <span className="font-semibold text-forest-deep">{formatPKR(goal.saved_amount)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-moss/75">Target</span>
            <span className="font-semibold text-forest-deep">{formatPKR(goal.target_amount)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-moss/75">Remaining</span>
            <span className="font-semibold text-forest-deep">{formatPKR(remaining)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-ink/55">Amount to add (PKR)</label>
            <input
              autoFocus
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              placeholder="0.00"
              className="mt-1 w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-moss"
            />
          </div>

          {error && <p className="text-sm text-coral">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border border-ink/12 py-2.5 text-sm font-medium text-ink/70 transition hover:border-ink/25"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-forest py-2.5 text-sm font-semibold text-paper transition hover:bg-forest-deep disabled:opacity-60"
            >
              {submitting ? "Adding…" : "Add Funds"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
