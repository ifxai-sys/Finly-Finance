import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, Bell, Check } from "lucide-react";

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function rangeLabel(start, end) {
  const opts = { month: "short", day: "numeric", year: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}

function iso(date) {
  return date.toISOString().slice(0, 10);
}

function buildPresets() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const last30Start = new Date(now);
  last30Start.setDate(now.getDate() - 29);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  return [
    {
      key: "this_month",
      label: "This Month",
      display: monthLabel(now),
      month: monthKey(now),
      start: iso(startOfThisMonth),
      end: iso(endOfThisMonth),
    },
    {
      key: "last_month",
      label: "Last Month",
      display: monthLabel(startOfLastMonth),
      month: monthKey(startOfLastMonth),
      start: iso(startOfLastMonth),
      end: iso(endOfLastMonth),
    },
    {
      key: "last_30",
      label: "Last 30 Days",
      display: rangeLabel(last30Start, now),
      month: null,
      start: iso(last30Start),
      end: iso(now),
    },
    {
      key: "this_year",
      label: "This Year",
      display: `Jan 1 – ${now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`,
      month: null,
      start: iso(startOfYear),
      end: iso(now),
    },
  ];
}

export default function Topbar({ name = "there", title, subtitle, onRangeChange, notifications = [] }) {
  const heading = title ?? `Welcome back, ${name}`;
  const sub = subtitle ?? "Here's what's happening with your finances today.";

  const presets = useMemo(buildPresets, []);
  const [selected, setSelected] = useState(presets[0]);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [readIds, setReadIds] = useState(() => new Set());

  const rangeRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rangeRef.current && !rangeRef.current.contains(e.target)) setRangeOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    function handleEscape(e) {
      if (e.key === "Escape") {
        setRangeOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function choosePreset(preset) {
    setSelected(preset);
    setRangeOpen(false);
    onRangeChange?.({
      key: preset.key,
      month: preset.month,
      label: preset.display,
      start: preset.start,
      end: preset.end,
    });
  }

  function applyCustom() {
    if (!customStart || !customEnd) return;
    const start = new Date(`${customStart}T00:00:00`);
    const end = new Date(`${customEnd}T00:00:00`);
    const custom = {
      key: "custom",
      label: "Custom Range",
      display: rangeLabel(start, end),
      month: null,
      start: customStart,
      end: customEnd,
    };
    setSelected(custom);
    setRangeOpen(false);
    onRangeChange?.({ key: "custom", month: null, label: custom.display, start: customStart, end: customEnd });
  }

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  function toggleNotifs() {
    setNotifOpen((v) => !v);
    setRangeOpen(false);
    if (!notifOpen) setReadIds(new Set(notifications.map((n) => n.id)));
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest-deep">{heading}</h1>
        <p className="mt-1 text-sm text-ink/55">{sub}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={rangeRef}>
          <button
            type="button"
            onClick={() => {
              setRangeOpen((v) => !v);
              setNotifOpen(false);
            }}
            aria-haspopup="true"
            aria-expanded={rangeOpen}
            className="flex items-center gap-2 rounded-full border border-ink/12 bg-paper px-4 py-2.5 text-sm font-medium text-ink/75 transition hover:border-ink/25"
          >
            <Calendar size={15} />
            {selected.display}
            <ChevronDown size={14} className={`transition-transform ${rangeOpen ? "rotate-180" : ""}`} />
          </button>

          {rangeOpen && (
            <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-ink/10 bg-paper p-2 shadow-xl">
              <ul>
                {presets.map((preset) => (
                  <li key={preset.key}>
                    <button
                      type="button"
                      onClick={() => choosePreset(preset)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-ink/75 transition hover:bg-cream"
                    >
                      <span>
                        <span className="block font-medium text-ink">{preset.label}</span>
                        <span className="block text-xs text-ink/45">{preset.display}</span>
                      </span>
                      {selected.key === preset.key && <Check size={15} className="text-moss" />}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-1 border-t border-ink/8 px-3 pt-3">
                <p className="text-xs font-medium text-ink/55">Custom Range</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full rounded-lg border border-ink/12 bg-cream px-2 py-1.5 text-xs text-ink outline-none focus:border-moss"
                  />
                  <span className="text-ink/40">–</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full rounded-lg border border-ink/12 bg-cream px-2 py-1.5 text-xs text-ink outline-none focus:border-moss"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyCustom}
                  disabled={!customStart || !customEnd}
                  className="mt-2 w-full rounded-lg bg-forest py-1.5 text-xs font-semibold text-paper transition hover:bg-forest-deep disabled:opacity-40"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={toggleNotifs}
            aria-haspopup="true"
            aria-expanded={notifOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink/12 bg-paper text-ink/70 transition hover:border-ink/25"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[10px] font-semibold text-paper">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-ink/10 bg-paper p-2 shadow-xl">
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-sm font-semibold text-ink">Notifications</p>
                <span className="text-xs text-ink/40">{unreadCount > 0 ? `${unreadCount} new` : "All read"}</span>
              </div>
              {notifications.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-ink/45">
                  You're all caught up — no new alerts.
                </p>
              ) : (
                <ul className="max-h-72 space-y-1 overflow-y-auto">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className="rounded-xl px-2.5 py-2.5 text-sm transition hover:bg-cream"
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`mt-1 h-2 w-2 flex-none rounded-full ${
                            n.tone === "coral"
                              ? "bg-coral"
                              : n.tone === "amber"
                              ? "bg-amber"
                              : "bg-moss"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{n.title}</p>
                          <p className="mt-0.5 text-xs text-ink/50">{n.message}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
