interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  up?: boolean;
}

/** Tiny inline trend line for board rows. */
export function Sparkline({ data, width = 110, height = 34, up }: SparklineProps) {
  if (data.length < 2) return <svg width={width} height={height} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const rising = up ?? data[data.length - 1] >= data[0];
  const color = rising ? 'var(--up)' : 'var(--down)';
  return (
    <svg width={width} height={height}>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface PriceChartProps {
  data: number[];
  height?: number;
}

/** Full-width area chart for the trade page. */
export function PriceChart({ data, height = 260 }: PriceChartProps) {
  const width = 760;
  if (data.length < 2) return <div style={{ height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 14;
  const stepX = width / (data.length - 1);
  const y = (v: number) => height - pad - ((v - min) / range) * (height - pad * 2);
  const linePts = data.map((v, i) => `${(i * stepX).toFixed(1)},${y(v).toFixed(1)}`);
  const rising = data[data.length - 1] >= data[0];
  const color = rising ? 'var(--up)' : 'var(--down)';
  const areaPath = `M0,${height} L${linePts.join(' L')} L${width},${height} Z`;

  // Horizontal gridlines.
  const gridLines = [0.25, 0.5, 0.75].map((f) => height - pad - f * (height - pad * 2));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      className="chart-wrap"
    >
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridLines.map((gy, i) => (
        <line key={i} x1="0" y1={gy} x2={width} y2={gy} stroke="var(--line)" strokeWidth="1" />
      ))}
      <path d={areaPath} fill="url(#area-grad)" />
      <polyline
        points={linePts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
