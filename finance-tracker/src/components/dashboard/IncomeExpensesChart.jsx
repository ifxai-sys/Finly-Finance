import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatPKR, formatCompactPKR } from "../../utils/currency";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-ink/10 bg-paper px-3.5 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-ink/60">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="mt-0.5 font-semibold" style={{ color: p.color }}>
          {p.name}: {formatPKR(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function IncomeExpensesChart({ data = [], isLoading }) {
  return (
    <div className="rounded-2xl bg-paper p-6 shadow-sm">
      <h3 className="font-semibold text-ink">Income vs Expenses</h3>

      <div className="mt-3 flex items-center gap-4 text-xs text-ink/60">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-moss" /> Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-coral" /> Expenses
        </span>
      </div>

      {!isLoading && data.length === 0 ? (
        <p className="mt-6 text-sm text-ink/45">No transactions recorded this month yet.</p>
      ) : (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#EDE9D8" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#8A9084" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v) => formatCompactPKR(v)}
                tick={{ fontSize: 11, fill: "#8A9084" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#3F6B4B"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#3F6B4B" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#D9564C"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#D9564C" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
