interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

/** Tiny inline trend line. */
export function Sparkline({ data, width = 84, height = 30, color, strokeWidth = 2 }: SparklineProps) {
  if (data.length < 2) return <svg width={width} height={height} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const stroke = color ?? (data[data.length - 1] >= data[0] ? 'var(--up)' : 'var(--down)');
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface AreaChartProps {
  data: number[];
  height?: number;
  color?: string;
  id?: string;
}

/** Soft area chart for the hero / profile cards. */
export function AreaChart({ data, height = 120, color = 'var(--brand)', id = 'g' }: AreaChartProps) {
  const width = 720;
  if (data.length < 2) return <div style={{ height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 10;
  const stepX = width / (data.length - 1);
  const y = (v: number) => height - pad - ((v - min) / range) * (height - pad * 2);
  const line = data.map((v, i) => `${(i * stepX).toFixed(1)},${y(v).toFixed(1)}`);
  const area = `M0,${height} L${line.join(' L')} L${width},${height} Z`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#area-${id})`} />
      <polyline
        points={line.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
