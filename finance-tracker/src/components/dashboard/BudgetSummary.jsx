import { Link } from "react-router-dom";
import { iconFor } from "./iconMap";
import { formatPKR } from "../../utils/currency";

export default function BudgetSummary({ budgets = [], isLoading }) {
  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ink">Budget Summary</h3>
        <Link to="/dashboard/budget" className="text-xs font-medium text-moss hover:underline">View All</Link>
      </div>

      {!isLoading && budgets.length === 0 && (
        <p className="mt-5 text-sm text-ink/45">No budget categories set up yet.</p>
      )}

      <ul className="mt-5 space-y-5">
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
  );
}
