import { LayoutGrid, Wallet, ArrowDownToLine, PiggyBank, Calendar, ChevronDown, MoreHorizontal } from "lucide-react";
import StatCard from "./StatCard";

const rows = [
  { month: "January", income: "$7,400", expenses: "$4,860", savings: "$2,540", rate: "34.3%" },
  { month: "February", income: "$7,200", expenses: "$4,760", savings: "$2,440", rate: "33.9%" },
  { month: "March", income: "$7,800", expenses: "$5,100", savings: "$2,700", rate: "34.6%" },
  { month: "April", income: "$7,300", expenses: "$4,920", savings: "$2,380", rate: "32.6%" },
];

export default function DashboardPreview() {
  return (
    <section id="demo" className="relative mx-auto max-w-6xl px-6 sm:px-10">
      <div className="rounded-[2rem] bg-paper p-6 shadow-2xl shadow-forest-deep/10 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage text-moss">
              <LayoutGrid size={16} />
            </span>
            <h2 className="font-display text-xl font-semibold text-forest-deep">My Dashboard</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/75">
            <Calendar size={15} />
            This Month
            <ChevronDown size={14} />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Income"
            value="$84,200"
            change="12.5%"
            tint="bg-sage"
            iconBg="bg-paper text-moss"
            icon={<Wallet size={16} />}
            valueColor="text-ink"
          />
          <StatCard
            label="Total Expenses"
            value="$58,640"
            change="8.2%"
            tint="bg-coral-tint"
            iconBg="bg-paper text-coral"
            icon={<ArrowDownToLine size={16} />}
            valueColor="text-coral"
          />
          <StatCard
            label="Net Savings"
            value="$25,560"
            change="15.8%"
            tint="bg-amber-tint"
            iconBg="bg-paper text-amber"
            icon={<PiggyBank size={16} />}
            valueColor="text-ink"
          />
        </div>

        <div className="mt-10">
          <h3 className="font-semibold text-ink">Monthly Overview</h3>
          <div className="mt-4 overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-forest text-left text-xs uppercase tracking-wide text-paper/80">
                  <th className="rounded-l-xl px-5 py-3 font-medium">Month</th>
                  <th className="px-5 py-3 font-medium">Income</th>
                  <th className="px-5 py-3 font-medium">Expenses</th>
                  <th className="px-5 py-3 font-medium">Savings</th>
                  <th className="px-5 py-3 font-medium">Savings Rate</th>
                  <th className="rounded-r-xl px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.month} className={i !== rows.length - 1 ? "border-b border-ink/8" : ""}>
                    <td className="px-5 py-4 font-medium text-ink">{r.month}</td>
                    <td className="px-5 py-4 text-ink/75">{r.income}</td>
                    <td className="px-5 py-4 text-ink/75">{r.expenses}</td>
                    <td className="px-5 py-4 text-ink/75">{r.savings}</td>
                    <td className="px-5 py-4 font-medium text-moss">{r.rate}</td>
                    <td className="px-5 py-4 text-ink/40">
                      <MoreHorizontal size={16} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
