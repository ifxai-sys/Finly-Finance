import { useEffect, useMemo, useState } from "react";
import { Wallet, FileWarning, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { iconFor } from "../components/dashboard/iconMap";
import { fetchTransactions } from "../api/expenses";
import { formatPKR, formatCompactPKR } from "../utils/currency";
import { useAuth } from "../context/AuthContext";

export default function AccountsPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
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

  const sorted = useMemo(
    () => [...transactions].sort((a, b) => a.occurred_on.localeCompare(b.occurred_on)),
    [transactions]
  );

  const balance = useMemo(
    () => sorted.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0),
    [sorted]
  );

  const totalIn = useMemo(
    () => sorted.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [sorted]
  );
  const totalOut = useMemo(
    () => sorted.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [sorted]
  );

  const balanceHistory = useMemo(() => {
    let running = 0;
    const byDay = new Map();
    sorted.forEach((t) => {
      running += t.type === "income" ? t.amount : -t.amount;
      byDay.set(t.occurred_on, running);
    });
    return [...byDay.entries()].map(([date, value]) => ({
      date: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      balance: Math.round(value),
    }));
  }, [sorted]);

  const recent = [...sorted].reverse().slice(0, 8);

  return (
    <DashboardLayout
      name={firstName}
      title="Accounts"
      subtitle="Your balance, calculated from every transaction you've logged."
    >
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-coral/30 bg-coral-tint px-5 py-3 text-sm text-coral">
          <FileWarning size={16} /> Couldn't load transactions: {error}
        </div>
      )}

      <div className="rounded-2xl bg-forest-deep p-6 text-paper shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper/10">
              <Wallet size={18} />
            </span>
            <div>
              <p className="text-sm text-paper/60">Primary Account</p>
              <p className="text-xs text-paper/40">Cash · derived from your transaction history</p>
            </div>
          </div>
          <span className="rounded-full bg-paper/10 px-3 py-1 text-xs font-medium text-paper/70">PKR</span>
        </div>
        <p className="mt-6 font-display text-4xl font-bold">
          {isLoading ? "…" : formatPKR(balance)}
        </p>
        <div className="mt-5 flex flex-wrap gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-paper/70">
            <ArrowUpRight size={14} style={{ color: "#8FD9A8" }} /> {formatPKR(totalIn)} in
          </span>
          <span className="flex items-center gap-1.5 text-paper/70">
            <ArrowDownRight size={14} style={{ color: "#F0938C" }} /> {formatPKR(totalOut)} out
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl bg-paper p-6 shadow-sm xl:col-span-2">
          <h3 className="font-semibold text-ink">Balance Over Time</h3>
          <div className="mt-4 h-64">
            {isLoading ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-cream-deep" />
            ) : balanceHistory.length < 2 ? (
              <div className="flex h-full items-center justify-center text-sm text-ink/40">
                Log a few more transactions to see your balance trend.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E7DC" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#7A8072" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => formatCompactPKR(v)}
                    tick={{ fontSize: 11, fill: "#7A8072" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip formatter={(value) => [formatPKR(value), "Balance"]} />
                  <Line type="monotone" dataKey="balance" stroke="#3F6B4B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-paper p-6 shadow-sm">
          <h3 className="font-semibold text-ink">Recent Activity</h3>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-ink/40">No transactions logged yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recent.map((tx) => {
                const Icon = iconFor(tx.icon);
                const positive = tx.type === "income";
                return (
                  <li key={tx.id} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-cream text-ink/60">
                      <Icon size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{tx.title}</p>
                      <p className="text-xs text-ink/40">
                        {new Date(`${tx.occurred_on}T00:00:00`).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`flex-none text-sm font-semibold ${positive ? "text-moss" : "text-coral"}`}>
                      {positive ? "+" : "-"}
                      {formatPKR(tx.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-ink/35">
        Bank &amp; card linking for multiple accounts isn't available yet — this balance is calculated
        from the transactions you've entered manually.
      </p>
    </DashboardLayout>
  );
}
