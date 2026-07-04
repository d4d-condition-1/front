interface RadarDatum {
  label: string;
  value: number; // 0~100
}

interface RadarChartProps {
  data: RadarDatum[];
  size?: number;
  color?: string;
}

/** N축 레이더(거미줄) 차트 — 의존성 없이 SVG 로 구현. */
export function RadarChart({ data, size = 260, color = "var(--color-primary-600)" }: RadarChartProps) {
  const n = data.length;
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 34; // 라벨 여백

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });

  const rings = [0.25, 0.5, 0.75, 1];
  const polygon = (radiusFor: (i: number) => number) =>
    data
      .map((_, i) => {
        const p = point(i, radiusFor(i));
        return `${p.x},${p.y}`;
      })
      .join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* 배경 그리드 */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={polygon(() => R * ring)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      ))}
      {/* 축 */}
      {data.map((_, i) => {
        const p = point(i, R);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth={1} />;
      })}
      {/* 데이터 영역 */}
      <polygon
        points={polygon((i) => (R * Math.max(0, Math.min(100, data[i].value))) / 100)}
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeWidth={2}
      />
      {data.map((_, i) => {
        const p = point(i, (R * data[i].value) / 100);
        return <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />;
      })}
      {/* 라벨 */}
      {data.map((d, i) => {
        const p = point(i, R + 18);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-muted"
            fontSize={11}
            fontWeight={600}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
