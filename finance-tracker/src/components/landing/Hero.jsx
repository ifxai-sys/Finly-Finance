import { Check, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import SavingsGoalsCard from "./SavingsGoalsCard";
import ThisMonthCard from "./ThisMonthCard";
import SpendingOverviewCard from "./SpendingOverviewCard";
import LeafSprig from "./LeafSprig";
import Avatar from "./Avatar";

const trustPoints = ["Smart Analytics", "Auto Calculations", "Secure & Private"];
const avatars = ["JM", "AK", "RS", "TN"];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-10 sm:px-10 lg:grid-cols-2 lg:pb-32 lg:pt-16">
        {/* Left: copy */}
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-paper px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-moss shadow-sm">
            <span className="h-2 w-2 rounded-full bg-amber" />
            2026 Edition
          </span>

          <h1 className="mt-6 font-display text-6xl font-bold leading-[0.95] text-forest-deep sm:text-7xl">
            Finance
            <br />
            <span className="italic font-medium text-moss">Tracker.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/65">
            A beautiful, easy-to-use dashboard to manage your money, track
            expenses, and achieve your savings goals.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-1.5 text-sm font-medium text-ink/75">
                <Check size={16} className="text-moss" />
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 font-medium text-paper shadow-lg shadow-forest/25 transition hover:bg-forest-deep"
            >
              Get Started Free
              <ArrowRight size={16} />
            </Link>
            <a
              href="#demo"
              className="flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-6 py-3.5 font-medium text-ink transition hover:border-ink/30"
            >
              View Demo
              <Play size={14} />
            </a>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {avatars.map((initials, i) => (
                <Avatar key={initials} initials={initials} index={i} />
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 text-amber" aria-hidden="true">
                {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <p className="text-sm text-ink/60">4.9/5 from 12,000+ users</p>
            </div>
          </div>
        </div>

        {/* Right: floating dashboard cards */}
        <div className="relative mx-auto h-[560px] w-full max-w-lg lg:mx-0">
          <div className="absolute right-0 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-cream-deep/70 blur-2xl" />
          <LeafSprig className="absolute right-2 top-0 h-32 w-32 opacity-90" />

          <SavingsGoalsCard className="absolute left-0 top-6 w-[280px]" />
          <ThisMonthCard className="absolute right-0 top-44 w-[220px]" />
          <SpendingOverviewCard className="absolute left-10 top-[300px] w-[300px] sm:left-16" />
        </div>
      </div>
    </section>
  );
}
