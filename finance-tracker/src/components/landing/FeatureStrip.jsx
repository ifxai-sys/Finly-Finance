import { ShieldCheck, Cloud, TrendingUp, Bell } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Bank-Level Security", copy: "Your data is encrypted and 100% secure." },
  { icon: Cloud, title: "Cloud Sync", copy: "Access your finances anytime, anywhere." },
  { icon: TrendingUp, title: "Smart Insights", copy: "Get personalized insights to save more." },
  { icon: Bell, title: "Reminders", copy: "Never miss a bill or saving goal." },
];

export default function FeatureStrip() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-14 sm:px-10">
      <div className="rounded-3xl border border-ink/8 bg-paper/60 p-8 sm:p-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-sage text-moss">
                <Icon size={18} />
              </span>
              <div>
                <h4 className="font-semibold text-ink">{title}</h4>
                <p className="mt-1 text-sm text-ink/60">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
