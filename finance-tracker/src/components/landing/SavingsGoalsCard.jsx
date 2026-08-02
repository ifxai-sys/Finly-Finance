import { Target, ArrowRight } from "lucide-react";

const goals = [
  { label: "Emergency Fund", pct: 78 },
  { label: "Holiday in Japan", pct: 62 },
  { label: "New Laptop", pct: 54 },
];

export default function SavingsGoalsCard({ className = "" }) {
  return (
    <div className={`rounded-3xl bg-paper p-6 shadow-xl shadow-forest-deep/10 ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-moss">
          <Target size={18} />
        </span>
        <h3 className="font-semibold text-ink">Savings Goals</h3>
      </div>

      <div className="mt-5 space-y-4">
        {goals.map((g) => (
          <div key={g.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink/80">{g.label}</span>
              <span className="font-semibold text-ink">{g.pct}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-cream-deep">
              <div
                className="h-1.5 rounded-full bg-moss"
                style={{ width: `${g.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <a
        href="#demo"
        className="mt-5 flex items-center gap-1.5 text-sm font-medium text-ink/70 transition hover:text-forest-deep"
      >
        View all goals <ArrowRight size={14} />
      </a>
    </div>
  );
}
