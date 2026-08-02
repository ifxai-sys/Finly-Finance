import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Trash2 } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import AddTransactionModal from "../components/dashboard/AddTransactionModal";
import { iconFor } from "../components/dashboard/iconMap";
import { createTransaction, deleteTransaction, fetchTransactions } from "../api/expenses";
import { formatPKR } from "../utils/currency";

const TABS = [
  { label: "All", value: null },
  { label: "Income", value: "income" },
  { label: "Expenses", value: "expense" },
];

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get("type"); // null | "income" | "expense"
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rows = await fetchTransactions({ limit: 200, type: activeType || undefined });
      setTransactions(rows);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeType]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(transaction) {
    await createTransaction(transaction);
    await load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this transaction?")) return;
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = transactions.filter((tx) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return tx.title.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout
      title="Transactions"
      subtitle="Every income and expense in one place — searchable and filterable."
    >
      <div className="rounded-2xl bg-paper p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-1 rounded-full bg-cream p-1">
            {TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() =>
                  setSearchParams(tab.value ? { type: tab.value } : {}, { replace: true })
                }
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeType === tab.value
                    ? "bg-forest text-paper"
                    : "text-ink/60 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions…"
                className="w-52 rounded-full border border-ink/12 bg-cream py-2 pl-9 pr-3.5 text-sm text-ink outline-none focus:border-moss"
              />
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper transition hover:bg-forest-deep"
            >
              <Plus size={15} /> Add
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-coral">Couldn't load transactions: {error}</p>}

        {isLoading && <p className="mt-6 text-sm text-ink/45">Loading…</p>}

        {!isLoading && filtered.length === 0 && (
          <p className="mt-6 text-sm text-ink/45">
            {search ? "No transactions match your search." : "No transactions yet — add your first one."}
          </p>
        )}

        {!isLoading && filtered.length > 0 && (
          <ul className="mt-5 divide-y divide-ink/8">
            {filtered.map((tx) => {
              const Icon = iconFor(tx.icon);
              const positive = tx.type === "income";
              return (
                <li key={tx.id} className="flex items-center gap-3 py-3.5">
                  <span
                    className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${
                      positive ? "bg-sage text-moss" : "bg-coral-tint text-coral"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{tx.title}</p>
                    <p className="text-xs text-ink/45">
                      {tx.category} · {formatDate(tx.occurred_on)}
                    </p>
                  </div>
                  <span className={`flex-none text-sm font-semibold ${positive ? "text-moss" : "text-coral"}`}>
                    {positive ? "+" : "-"}
                    {formatPKR(tx.amount, { decimals: 2 })}
                  </span>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deletingId === tx.id}
                    className="flex-none rounded-full p-2 text-ink/35 transition hover:bg-coral-tint hover:text-coral disabled:opacity-50"
                    aria-label="Delete transaction"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AddTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
    </DashboardLayout>
  );
}
