import { useMemo, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StatRow from "../components/dashboard/StatRow";
import SpendingOverview from "../components/dashboard/SpendingOverview";
import IncomeExpensesChart from "../components/dashboard/IncomeExpensesChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import BudgetSummary from "../components/dashboard/BudgetSummary";
import SavingsGoals from "../components/dashboard/SavingsGoals";
import MarketSnapshot from "../components/dashboard/MarketSnapshot";
import CurrencyConverter from "../components/dashboard/CurrencyConverter";
import CryptoSnapshot from "../components/dashboard/CryptoSnapshot";
import AddTransactionModal from "../components/dashboard/AddTransactionModal";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "../hooks/useDashboard";

function buildNotifications(data) {
  if (!data) return [];
  const items = [];

  (data.budget_summary ?? []).forEach((b) => {
    if (b.pct >= 100) {
      items.push({
        id: `budget-over-${b.id}`,
        tone: "coral",
        title: `${b.category} budget exceeded`,
        message: `You've spent ${b.pct}% of your ${b.category} budget this month.`,
      });
    } else if (b.pct >= 85) {
      items.push({
        id: `budget-near-${b.id}`,
        tone: "amber",
        title: `${b.category} budget almost used up`,
        message: `You're at ${b.pct}% of your ${b.category} budget.`,
      });
    }
  });

  (data.savings_goals ?? []).forEach((g) => {
    if (g.pct >= 100) {
      items.push({
        id: `goal-done-${g.id}`,
        tone: "moss",
        title: `"${g.title}" goal reached!`,
        message: "Nice work — you've hit your savings target.",
      });
    } else if (g.pct >= 80) {
      items.push({
        id: `goal-near-${g.id}`,
        tone: "moss",
        title: `Almost there: "${g.title}"`,
        message: `You're ${g.pct}% of the way to this goal.`,
      });
    }
  });

  return items.slice(0, 6);
}

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];
  const [month, setMonth] = useState(undefined);
  const { data, isLoading, error, refresh, addTransaction } = useDashboard(month);
  const [modalOpen, setModalOpen] = useState(false);

  const notifications = useMemo(() => buildNotifications(data), [data]);

  function handleRangeChange(range) {
    // The dashboard aggregate is computed server-side per calendar month
    // ("YYYY-MM"); presets without a clean month equivalent (Last 30 Days,
    // This Year, custom ranges) fall back to the current month rather than
    // silently doing nothing.
    setMonth(range.month ?? undefined);
  }

  return (
    <DashboardLayout name={firstName} onRangeChange={handleRangeChange} notifications={notifications}>
      {error && (
        <div className="rounded-2xl border border-coral/30 bg-coral-tint px-5 py-3 text-sm text-coral">
          Couldn't load your dashboard: {error}
        </div>
      )}

      <StatRow stats={data?.stats} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SpendingOverview
          segments={data?.spending_overview}
          totalExpenses={data?.total_expenses ?? 0}
          isLoading={isLoading}
        />
        <IncomeExpensesChart data={data?.income_expenses_chart} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <RecentTransactions
          transactions={data?.recent_transactions}
          isLoading={isLoading}
          onAddClick={() => setModalOpen(true)}
        />
        <BudgetSummary budgets={data?.budget_summary} isLoading={isLoading} />
        <SavingsGoals goals={data?.savings_goals} isLoading={isLoading} onChanged={refresh} />
      </div>

      {/* Live public API integrations — real-time data via Finnhub, Frankfurter & CoinGecko (proxied through the FastAPI backend) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <MarketSnapshot />
        <CurrencyConverter />
        <CryptoSnapshot />
      </div>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addTransaction}
      />
    </DashboardLayout>
  );
}
