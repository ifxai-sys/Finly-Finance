export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="16" fill="#1E3A2B" />
        <path d="M9 20 L13 12 L17 17 L23 8" stroke="#E3971F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span className="font-display text-2xl font-semibold text-forest-deep">
        Finly<span className="text-amber">.</span>
      </span>
    </div>
  );
}
