interface ProgressRingProps {
  value: number; // 0~100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}

/** 원형 진행 링 (SVG). 점수/진척도 시각화용. */
export function ProgressRing({
  value,
  size = 128,
  stroke = 12,
  label,
  sublabel,
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef0f6" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-primary-600)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        {label && <span className="text-2xl font-bold text-slate-900">{label}</span>}
        {sublabel && <span className="text-xs text-slate-400">{sublabel}</span>}
      </div>
    </div>
  );
}
