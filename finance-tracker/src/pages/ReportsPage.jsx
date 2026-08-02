import { useEffect, useMemo, useState } from "react";
import { Download, FileWarning } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { iconFor } from "../components/dashboard/iconMap";
import { fetchTransactions } from "../api/expenses";
import { formatPKR, formatCompactPKR } from "../utils/currency";
import { useAuth } from "../context/AuthContext";

const PALETTE = ["#3F6B4B", "#D9564C", "#E3A857", "#5B7FA6", "#8E6C8A", "#4C9A8B", "#B5533C", "#7C8B3F"];

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 5);
  start.setDate(1);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function monthKey(dateStr) {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

function monthDisplay(key) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
}

function toCsv(rows) {
  const header = ["Date", "Title", "Category", "Type", "Amount (PKR)"];
  const lines = rows.map((tx) =>
    [tx.occurred_on, `"${tx.title.replace(/"/g, '""')}"`, tx.category, tx.type, tx.amount].join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export default function ReportsPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(defaultRange());

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchTransactions({ limit: 1000 })
      .then((data) => {
        if (!cancelled) setTransactions(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => transactions.filter((tx) => tx.occurred_on >= range.start && tx.occurred_on <= range.end),
    [transactions, range]
  );

  const totals = useMemo(() => {
    const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expenses, net: income - expenses };
  }, [filtered]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map();
    filtered
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const existing = map.get(t.category) ?? { amount: 0, icon: t.icon };
        existing.amount += t.amount;
        map.set(t.category, existing);
      });
    const total = [...map.values()].reduce((s, v) => s + v.amount, 0) || 1;
    return [...map.entries()]
      .map(([category, { amount, icon }], i) => ({
        category,
        amount,
        icon,
        pct: Math.round((amount / total) * 100),
        color: PALETTE[i % PALETTE.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filtered]);

  const monthlyTrend = useMemo(() => {
    const map = new Map();
    filtered.forEach((t) => {
      const key = monthKey(t.occurred_on);
      if (!map.has(key)) map.set(key, { month: key, income: 0, expenses: 0 });
      const bucket = map.get(key);
      if (t.type === "income") bucket.income += t.amount;
      else bucket.expenses += t.amount;
    });
    return [...map.values()]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((b) => ({ ...b, label: monthDisplay(b.month) }));
  }, [filtered]);

  function handleExport() {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-report_${range.start}_to_${range.end}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardLayout
      name={firstName}
      title="Reports"
      subtitle="Spending trends and exportable data for the selected range."
      onRangeChange={(r) => setRange({ start: r.start, end: r.end })}
    >
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-coral/30 bg-coral-tint px-5 py-3 text-sm text-coral">
          <FileWarning size={16} /> Couldn't load transactions: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl bg-paper p-5 shadow-sm">
          <p className="text-sm text-ink/55">Total Income</p>
          <p className="mt-2 font-display text-2xl font-semibold text-moss">{formatPKR(totals.income)}</p>
        </div>
        <div className="rounded-2xl bg-paper p-5 shadow-sm">
          <p className="text-sm text-ink/55">Total Expenses</p>
          <p className="mt-2 font-display text-2xl font-semibold text-coral">{formatPKR(totals.expenses)}</p>
        </div>
        <div className="rounded-2xl bg-paper p-5 shadow-sm">
          <p className="text-sm text-ink/55">Net Savings</p>
          <p className={`mt-2 font-display text-2xl font-semibold ${totals.net >= 0 ? "text-ink" : "text-coral"}`}>
            {formatPKR(totals.net)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl bg-paper p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink">Income vs. Expenses by Month</h3>
            <button
              type="button"
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-medium text-ink/60 transition hover:border-ink/25 hover:text-ink disabled:opacity-40"
            >
              <Download size={12} />
              Export CSV
            </button>
          </div>

          <div className="mt-4 h-72">
            {isLoading ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-cream-deep" />
            ) : monthlyTrend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-ink/40">
                No transactions in this range yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7DC" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#7A8072" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => formatCompactPKR(v)}
                    tick={{ fontSize: 12, fill: "#7A8072" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value, name) => [formatPKR(value), name === "income" ? "Income" : "Expenses"]}
                  />
                  <Legend formatter={(v) => (v === "income" ? "Income" : "Expenses")} />
                  <Bar dataKey="income" fill="#3F6B4B" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" fill="#D9564C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-paper p-6 shadow-sm">
          <h3 className="font-semibold text-ink">Spending by Category</h3>
          {isLoading ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-cream-deep" />
              ))}
            </div>
          ) : categoryBreakdown.length === 0 ? (
            <p className="mt-4 text-sm text-ink/40">No spending in this range yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {categoryBreakdown.map((c) => {
                const Icon = iconFor(c.icon);
                return (
                  <li key={c.category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-ink/75">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${c.color}22`, color: c.color }}
                        >
                          <Icon size={12} />
                        </span>
                        {c.category}
                      </span>
                      <span className="font-medium text-ink">{formatPKR(c.amount)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-cream-deep">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
