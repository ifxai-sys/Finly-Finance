export default function StatCard({ label, value, change, tint, iconBg, icon, valueColor }) {
  return (
    <div className={`rounded-2xl p-5 ${tint}`}>
      <div className="flex items-start justify-between">
        <span className="text-sm text-ink/65">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>
          {icon}
        </span>
      </div>
      <p className={`mt-3 font-display text-2xl font-semibold ${valueColor}`}>{value}</p>
      <p className="mt-1 text-sm text-moss">↑ {change} vs last month</p>
    </div>
  );
}
