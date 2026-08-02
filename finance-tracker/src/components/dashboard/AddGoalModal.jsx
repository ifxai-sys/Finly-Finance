import { useState } from "react";
import { X } from "lucide-react";
import { ICON_OPTIONS } from "./iconMap";

export default function AddGoalModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("shield-check");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const parsedTarget = Number(target);
    const parsedSaved = Number(saved || 0);
    if (!title.trim()) {
      setError("Please enter a goal name.");
      return;
    }
    if (!parsedTarget || parsedTarget <= 0) {
      setError("Target amount must be a positive number.");
      return;
    }
    if (parsedSaved < 0) {
      setError("Amount already saved can't be negative.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), icon, target_amount: parsedTarget, saved_amount: parsedSaved });
      setTitle("");
      setTarget("");
      setSaved("");
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
          <h3 className="font-display text-lg font-semibold text-ink">Create Savings Goal</h3>
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
            <label className="text-xs font-medium text-ink/55">Goal name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New Car, Wedding, Emergency Fund"
              className="mt-1 w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-moss"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink/55">Target amount (PKR)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-moss"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/55">Already saved (PKR)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-moss"
              />
            </div>
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
            {submitting ? "Saving…" : "Create Goal"}
          </button>
        </form>
      </div>
    </div>
  );
}
