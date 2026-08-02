import { useState } from "react";
import {
  LayoutGrid,
  ArrowLeftRight,
  Download,
  Upload,
  Wallet,
  PiggyBank,
  BarChart3,
  Calendar,
  Landmark,
  Settings,
  Crown,
  ChevronDown,
  LogOut,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../landing/Logo";
import Avatar from "../landing/Avatar";
import { useAuth } from "../../context/AuthContext";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid, to: "/dashboard" },
  { label: "Transactions", icon: ArrowLeftRight, to: "/dashboard/transactions" },
  { label: "Income", icon: Download, to: "/dashboard/transactions?type=income" },
  { label: "Expenses", icon: Upload, to: "/dashboard/transactions?type=expense" },
  { label: "Budget", icon: Wallet, to: "/dashboard/budget" },
  { label: "Savings Goals", icon: PiggyBank, to: "/dashboard/goals" },
  { label: "Reports", icon: BarChart3, to: "/dashboard/reports" },
  { label: "Calendar", icon: Calendar, to: "/dashboard/calendar" },
  { label: "Accounts", icon: Landmark, to: "/dashboard/accounts" },
  { label: "Settings", icon: Settings, to: "/dashboard/settings" },
];

export function isActive(pathname, search, to) {
  const [toPath, toQuery] = to.split("?");
  if (pathname !== toPath) return false;
  if (!toQuery) return !search; // "Transactions" (no query) is only active with no filter
  return search === `?${toQuery}`;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUpgrade, setShowUpgrade] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="hidden w-64 flex-none flex-col border-r border-ink/8 bg-paper px-5 py-6 lg:flex">
      <Logo className="px-1" />

      <nav className="mt-8 flex-1 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
          const active = isActive(location.pathname, location.search, to);
          return (
            <Link
              key={label}
              to={to}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-forest text-paper"
                  : "text-ink/60 hover:bg-cream-deep hover:text-ink"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl bg-amber-tint p-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber/20 text-amber">
          <Crown size={15} />
        </span>
        <p className="mt-2 text-sm font-semibold text-ink">Go Premium</p>
        <p className="mt-1 text-xs leading-relaxed text-ink/55">
          Unlock advanced reports, custom categories and more.
        </p>
        <button
          onClick={() => setShowUpgrade(true)}
          className="mt-3 w-full rounded-xl bg-forest py-2 text-xs font-semibold text-paper transition hover:bg-forest-deep"
        >
          Upgrade Now
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-ink/8 pt-5">
        <Avatar initials={getInitials(user?.name)} index={0} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{user?.name ?? "Guest"}</p>
          <p className="truncate text-xs text-ink/45">{user?.email ?? "Premium Plan"}</p>
        </div>
        <ChevronDown size={14} className="text-ink/40" />
      </div>
      <button
        onClick={handleLogout}
        className="mt-3 flex items-center gap-2 px-1 text-sm font-medium text-ink/50 transition hover:text-coral"
      >
        <LogOut size={15} />
        Log Out
      </button>

      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-paper p-6 text-center shadow-xl">
            <div className="flex justify-end">
              <button
                onClick={() => setShowUpgrade(false)}
                className="rounded-full p-1.5 text-ink/45 hover:bg-cream hover:text-ink"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-tint text-amber">
              <Crown size={22} />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">Premium is on the way</h3>
            <p className="mt-2 text-sm text-ink/55">
              Advanced reports, custom categories, and multi-account support are in the works.
              There's nothing to buy yet — check back soon.
            </p>
            <button
              onClick={() => setShowUpgrade(false)}
              className="mt-5 w-full rounded-xl bg-forest py-2.5 text-sm font-semibold text-paper transition hover:bg-forest-deep"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
