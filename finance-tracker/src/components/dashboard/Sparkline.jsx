/**
 * A minimal trend line rendered as raw SVG — deliberately not using recharts here
 * since these render many-per-row (crypto list) or need a tight inline footprint
 * (converter trend), where a plain polyline is cheaper and simpler than a full chart.
 */
export default function Sparkline({
  data,
  width = 120,
  height = 36,
  stroke = "#3F6B4B",
  strokeWidth = 2,
  fill = false,
  className = "",
}) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((value, i) => {
    const x = i * stepX;
    const y = height - ((value - min) / range) * height;
    return [x, y];
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      {fill && <path d={areaPath} fill={stroke} fillOpacity="0.12" stroke="none" />}
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
