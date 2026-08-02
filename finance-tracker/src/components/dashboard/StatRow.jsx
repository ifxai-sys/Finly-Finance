import { Wallet, Download, Upload, PiggyBank } from "lucide-react";
import { formatSignedPKR } from "../../utils/currency";

const CONFIG = [
  { key: "totalBalance", label: "Total Balance", icon: Wallet, tone: "forest" },
  { key: "totalIncome", label: "Total Income", icon: Download, tone: "sage" },
  { key: "totalExpenses", label: "Total Expenses", icon: Upload, tone: "coral" },
  { key: "netSavings", label: "Net Savings", icon: PiggyBank, tone: "amber" },
];

const iconBg = {
  forest: "bg-forest text-paper",
  sage: "bg-sage text-moss",
  coral: "bg-coral-tint text-coral",
  amber: "bg-amber-tint text-amber",
};

export default function StatRow({ stats, isLoading }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CONFIG.map(({ key, label, icon: Icon, tone }) => {
        const stat = stats?.[key];
        return (
          <div key={key} className="rounded-2xl bg-paper p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-sm text-ink/55">{label}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${iconBg[tone]}`}>
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-3 font-display text-2xl font-semibold text-ink">
              {isLoading ? "…" : formatSignedPKR(stat?.value ?? 0, { decimals: 0 }).replace("+", "")}
            </p>
            {!isLoading && stat && (
              <p className={`mt-1 text-sm ${stat.up ? "text-moss" : "text-coral"}`}>
                {stat.up ? "↑" : "↓"} {stat.change_pct}%{" "}
                <span className="text-ink/45">vs last month</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
