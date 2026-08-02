import { ArrowUp } from "lucide-react";

export default function ThisMonthCard({ className = "" }) {
  return (
    <div className={`rounded-3xl bg-forest p-6 text-paper shadow-xl shadow-forest-deep/20 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-paper/70">This Month</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber text-forest-deep">
          <ArrowUp size={16} />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">+$2,380</p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-paper/60">vs last month</span>
        <span className="font-semibold text-amber">+18.6%</span>
      </div>
    </div>
  );
}
