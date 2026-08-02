import DonutChart from "../landing/DonutChart";
import { formatPKR } from "../../utils/currency";

export default function SpendingOverview({ segments = [], totalExpenses = 0, isLoading }) {
  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <h3 className="font-semibold text-ink">Spending Overview</h3>

      {!isLoading && segments.length === 0 && (
        <p className="mt-6 text-sm text-ink/45">No expenses recorded this month yet.</p>
      )}

      {(isLoading || segments.length > 0) && (
        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative flex h-48 w-48 flex-none items-center justify-center">
            <DonutChart segments={segments.map((s) => ({ ...s, value: s.pct }))} size={192} />
            <div className="absolute flex w-24 flex-col items-center text-center">
              <span className="font-display text-base font-bold leading-tight text-ink">
                {formatPKR(totalExpenses)}
              </span>
              <span className="text-[10px] text-ink/45">Total Expenses</span>
            </div>
          </div>

          <ul className="w-full space-y-2.5 text-sm">
            {segments.map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ backgroundColor: s.color }} />
                <span className="flex-1 text-ink/75">{s.label}</span>
                <span className="font-medium text-ink">{formatPKR(s.amount)}</span>
                <span className="w-12 text-right text-ink/45">{s.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
