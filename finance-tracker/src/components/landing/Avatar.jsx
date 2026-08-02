const palette = ["#3F6B4B", "#E3971F", "#D9564C", "#1E3A2B"];

export default function Avatar({ initials, index = 0, className = "" }) {
  const bg = palette[index % palette.length];
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream text-[11px] font-semibold text-paper ${className}`}
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
