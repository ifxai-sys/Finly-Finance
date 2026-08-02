const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Small visual gap between adjacent segments so multi-category charts read
// clearly instead of looking like one solid ring. Skipped entirely when
// there's only one segment (nothing to separate it from).
const GAP = 2.5;

export default function DonutChart({ segments = [], size = 112 }) {
  const visible = segments.filter((seg) => seg.value > 0);
  const style = { width: size, height: size };

  if (visible.length === 0) {
    return (
      <svg viewBox="0 0 110 110" className="-rotate-90" style={style}>
        <circle cx="55" cy="55" r={RADIUS} fill="none" stroke="#EEF0E8" strokeWidth="14" />
      </svg>
    );
  }

  const gap = visible.length > 1 ? GAP : 0;
  let offset = 0;

  return (
    <svg viewBox="0 0 110 110" className="-rotate-90" style={style}>
      <circle cx="55" cy="55" r={RADIUS} fill="none" stroke="#EEF0E8" strokeWidth="14" />
      {visible.map((seg) => {
        const rawDash = (seg.value / 100) * CIRCUMFERENCE;
        const dash = Math.max(rawDash - gap, 0);
        const circle = (
          <circle
            key={seg.label}
            cx="55"
            cy="55"
            r={RADIUS}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
        offset += rawDash;
        return circle;
      })}
    </svg>
  );
}
