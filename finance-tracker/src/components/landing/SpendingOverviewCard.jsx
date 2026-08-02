import DonutChart from "./DonutChart";

const segments = [
  { label: "Needs", value: 50, color: "#1E3A2B" },
  { label: "Wants", value: 30, color: "#E3971F" },
  { label: "Savings", value: 20, color: "#8FB79A" },
];

export default function SpendingOverviewCard({ className = "" }) {
  return (
    <div className={`rounded-3xl bg-paper p-6 shadow-xl shadow-forest-deep/10 ${className}`}>
      <h3 className="font-semibold text-ink">Spending Overview</h3>
      <div className="mt-4 flex items-center gap-6">
        <DonutChart segments={segments} />
        <ul className="space-y-2.5 text-sm">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="w-16 text-ink/80">{s.label}</span>
              <span className="font-semibold text-ink">{s.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
