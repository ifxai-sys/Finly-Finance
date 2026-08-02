import { Plus } from "lucide-react";
import { iconFor } from "./iconMap";
import { formatPKR } from "../../utils/currency";

const iconBg = {
  income: "bg-sage text-moss",
  expense: "bg-coral-tint text-coral",
};

function formatMeta(tx) {
  const date = new Date(`${tx.occurred_on}T00:00:00`);
  const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${tx.type === "income" ? "Income" : "Expense"} · ${label}`;
}

export default function RecentTransactions({ transactions = [], isLoading, onAddClick }) {
  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ink">Recent Transactions</h3>
        <button
          onClick={onAddClick}
          className="flex items-center gap-1 rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-forest-deep"
        >
          <Plus size={13} /> Add
        </button>
      </div>

      {isLoading && <p className="mt-5 text-sm text-ink/45">Loading…</p>}

      {!isLoading && transactions.length === 0 && (
        <p className="mt-5 text-sm text-ink/45">
          No transactions yet — add your first one to get started.
        </p>
      )}

      <ul className="mt-5 space-y-4">
        {transactions.map((tx) => {
          const Icon = iconFor(tx.icon);
          const positive = tx.type === "income";
          return (
            <li key={tx.id} className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${iconBg[tx.type]}`}
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{tx.title}</p>
                <p className="text-xs text-ink/45">{formatMeta(tx)}</p>
              </div>
              <span className={`flex-none text-sm font-semibold ${positive ? "text-moss" : "text-coral"}`}>
                {positive ? "+" : "-"}
                {formatPKR(tx.amount, { decimals: 2 })}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
