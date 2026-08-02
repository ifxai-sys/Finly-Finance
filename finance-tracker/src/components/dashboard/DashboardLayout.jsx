import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar, { NAV_ITEMS, isActive } from "./Sidebar";
import Topbar from "./Topbar";
import Logo from "../landing/Logo";
import { useAuth } from "../../context/AuthContext";

// Mobile navigation drawer. Below the `lg` breakpoint the persistent Sidebar
// is hidden entirely, so without this there was no way for phone/tablet
// users to navigate between pages at all.
function MobileDrawer({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!open) return null;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-72 flex-col overflow-y-auto bg-paper px-5 py-6 shadow-xl">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-ink/45 hover:bg-cream hover:text-ink"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-1">
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
            const active = isActive(location.pathname, location.search, to);
            return (
              <Link
                key={label}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active ? "bg-forest text-paper" : "text-ink/60 hover:bg-cream-deep hover:text-ink"
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink/8 pt-4">
          <p className="truncate text-sm font-medium text-ink">{user?.name ?? "Guest"}</p>
          <p className="truncate text-xs text-ink/45">{user?.email ?? ""}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-ink/50 transition hover:text-coral"
          >
            <LogOut size={15} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  name,
  title,
  subtitle,
  onRangeChange,
  notifications,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream font-body text-ink">
      <Sidebar />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="min-w-0 flex-1 space-y-6 px-6 py-8 sm:px-8 lg:px-10">
        {/* Mobile-only header bar: hamburger + logo, since the Sidebar is hidden below lg */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink/12 bg-paper text-ink/60 shadow-sm transition hover:text-ink"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <Logo />
        </div>

        <Topbar
          name={name}
          title={title}
          subtitle={subtitle}
          onRangeChange={onRangeChange}
          notifications={notifications}
        />
        {children}
      </main>
    </div>
  );
}
