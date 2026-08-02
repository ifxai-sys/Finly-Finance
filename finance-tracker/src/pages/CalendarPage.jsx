import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileWarning } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { iconFor } from "../components/dashboard/iconMap";
import { fetchTransactions } from "../api/expenses";
import { formatPKR } from "../utils/currency";
import { useAuth } from "../context/AuthContext";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function toDateKey(y, m, d) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function buildGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];

  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(toDateKey(today.getFullYear(), today.getMonth(), today.getDate()));
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

  const byDay = useMemo(() => {
    const map = new Map();
    transactions.forEach((tx) => {
      if (!map.has(tx.occurred_on)) map.set(tx.occurred_on, []);
      map.get(tx.occurred_on).push(tx);
    });
    return map;
  }, [transactions]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const grid = useMemo(() => buildGrid(year, month), [year, month]);
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedTransactions = byDay.get(selectedDay) ?? [];
  const selectedNet = selectedTransactions.reduce(
    (s, t) => s + (t.type === "income" ? t.amount : -t.amount),
    0
  );

  function changeMonth(delta) {
    setCursor(new Date(year, month + delta, 1));
  }

  return (
    <DashboardLayout name={firstName} title="Calendar" subtitle="See what came in and went out, day by day.">
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-coral/30 bg-coral-tint px-5 py-3 text-sm text-coral">
          <FileWarning size={16} /> Couldn't load transactions: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl bg-paper p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">
              {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-ink/25 hover:text-ink"
                aria-label="Previous month"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
                className="rounded-full border border-ink/10 px-3 py-1.5 text-xs font-medium text-ink/60 transition hover:border-ink/25 hover:text-ink"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:border-ink/25 hover:text-ink"
                aria-label="Next month"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-ink/40">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1.5">
            {grid.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const key = toDateKey(year, month, day);
              const dayTx = byDay.get(key) ?? [];
              const net = dayTx.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
              const isSelected = key === selectedDay;
              const isToday = key === todayKey;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay(key)}
                  className={`flex h-16 flex-col items-start rounded-xl border p-2 text-left transition ${
                    isSelected
                      ? "border-forest bg-sage"
                      : isToday
                      ? "border-moss/40 bg-cream"
                      : "border-transparent bg-cream hover:border-ink/15"
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? "text-forest-deep" : "text-ink/70"}`}>
                    {day}
                  </span>
                  {dayTx.length > 0 && (
                    <span className={`mt-auto text-[10px] font-semibold ${net >= 0 ? "text-moss" : "text-coral"}`}>
                      {net >= 0 ? "+" : ""}
                      {formatPKR(net, { decimals: 0 })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isLoading && (
            <p className="mt-4 text-center text-xs text-ink/40">Loading transaction history…</p>
          )}
        </div>

        <div className="rounded-2xl bg-paper p-6 shadow-sm">
          <h3 className="font-semibold text-ink">
            {new Date(`${selectedDay}T00:00:00`).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <p className={`mt-1 text-sm font-medium ${selectedNet >= 0 ? "text-moss" : "text-coral"}`}>
            Net: {selectedNet >= 0 ? "+" : ""}
            {formatPKR(selectedNet)}
          </p>

          {selectedTransactions.length === 0 ? (
            <p className="mt-6 text-sm text-ink/40">No transactions on this day.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {selectedTransactions.map((tx) => {
                const Icon = iconFor(tx.icon);
                const positive = tx.type === "income";
                return (
                  <li key={tx.id} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-cream text-ink/60">
                      <Icon size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{tx.title}</p>
                      <p className="text-xs text-ink/40">{tx.category}</p>
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
    </DashboardLayout>
  );
}
