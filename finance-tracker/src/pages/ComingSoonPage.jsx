import { Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";

export default function ComingSoonPage({ title, description, icon: Icon }) {
  return (
    <DashboardLayout title={title} subtitle={description}>
      <div className="flex flex-col items-center justify-center rounded-2xl bg-paper px-6 py-20 text-center shadow-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage text-moss">
          <Icon size={26} />
        </span>
        <h2 className="mt-5 font-display text-xl font-semibold text-ink">{title} is on the way</h2>
        <p className="mt-2 max-w-sm text-sm text-ink/55">{description}</p>
        <Link
          to="/dashboard"
          className="mt-6 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-forest-deep"
        >
          Back to Dashboard
        </Link>
      </div>
    </DashboardLayout>
  );
}
