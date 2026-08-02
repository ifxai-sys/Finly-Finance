import { useState } from "react";
import { X } from "lucide-react";
import { ICON_OPTIONS } from "./iconMap";

const CATEGORY_ICON_HINTS = {
  Salary: "wallet",
  Freelance: "briefcase",
  Groceries: "shopping_cart",
  Housing: "home",
  Food: "utensils",
  Transportation: "car",
  Fuel: "fuel",
  Entertainment: "clapperboard",
};

function guessIcon(category, type) {
  return CATEGORY_ICON_HINTS[category] || (type === "income" ? "wallet" : "shopping_cart");
}

export default function AddTransactionModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [occurredOn, setOccurredOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [icon, setIcon] = useState("shopping_cart");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!title.trim() || !category.trim()) {
      setError("Please fill in a title and category.");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        category: category.trim(),
        icon,
        type,
        amount: parsedAmount,
        occurred_on: occurredOn,
      });
      setTitle("");
      setCategory("");
      setAmount("");
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
          <h3 className="font-display text-lg font-semibold text-ink">Add Transaction</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink/45 hover:bg-cream hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
                type === "expense" ? "bg-coral text-paper" : "bg-cream text-ink/60"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
                type === "income" ? "bg-forest text-paper" : "bg-cream text-ink/60"
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-ink/55">Title</label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIcon((prev) => guessIcon(category, type) || prev);
              }}
              placeholder={type === "income" ? "Salary" : "Grocery Shopping"}
              className="mt-1 w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-moss"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink/55">Category</label>
            <input
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setIcon(guessIcon(e.target.value, type));
              }}
              placeholder={type === "income" ? "Income" : "Food"}
              className="mt-1 w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-moss"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink/55">Amount (PKR)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-moss"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/55">Date</label>
              <input
                type="date"
                value={occurredOn}
                onChange={(e) => setOccurredOn(e.target.value)}
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
            {submitting ? "Saving…" : "Save Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}
