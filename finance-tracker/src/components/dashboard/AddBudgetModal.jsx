import { useState } from "react";
import { X } from "lucide-react";
import { ICON_OPTIONS } from "./iconMap";

export default function AddBudgetModal({ open, onClose, onSubmit }) {
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState("home");
  const [limit, setLimit] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const parsedLimit = Number(limit);
    if (!category.trim()) {
      setError("Please enter a category name.");
      return;
    }
    if (!parsedLimit || parsedLimit <= 0) {
      setError("Monthly limit must be a positive number.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ category: category.trim(), icon, monthly_limit: parsedLimit });
      setCategory("");
      setLimit("");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-paper p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Add Budget Category</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink/45 hover:bg-cream hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-ink/55">Category name</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Health, Travel, Subscriptions"
              className="mt-1 w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-moss"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink/55">Monthly limit (PKR)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="0.00"
              className="mt-1 w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-moss"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink/55">Icon</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-moss"
            >
              {ICON_OPTIONS.map((key) => (
                <option key={key} value={key}>
                  {key.replace(/[_-]/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-coral">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-forest py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Add Budget"}
          </button>
        </form>
      </div>
    </div>
  );
}
