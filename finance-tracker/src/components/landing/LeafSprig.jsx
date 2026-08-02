export default function LeafSprig({ className = "" }) {
  return (
    <svg viewBox="0 0 140 160" className={className} fill="none" aria-hidden="true">
      <path
        d="M70 150 C60 110 55 70 75 20"
        stroke="#2F5233"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M75 20 C50 30 30 55 32 85 C58 82 76 58 75 20 Z"
        fill="#3F6B4B"
      />
      <path
        d="M75 55 C100 50 118 30 120 8 C95 12 78 28 75 55 Z"
        fill="#2F5233"
      />
    </svg>
  );
}
