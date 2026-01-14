import { cn } from "@/lib/utils";

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({
  values,
  width = 60,
  height = 20,
  className,
}: SparklineProps) {
  if (values.length === 0) {
    return null;
  }

  // Padding to ensure dots aren't clipped at edges
  const dotRadius = 2.5;
  const padding = dotRadius + 1;
  const drawWidth = width - padding * 2;
  const drawHeight = height - padding * 2;

  // Handle single value - show a centered dot
  if (values.length === 1) {
    const y = padding + drawHeight - (values[0] / 100) * drawHeight;
    return (
      <svg
        width={width}
        height={height}
        className={cn("inline-block", className)}
        aria-label={`Pass rate: ${values[0]}%`}
      >
        <circle
          cx={width / 2}
          cy={y}
          r={dotRadius}
          className="fill-blue-500"
        />
      </svg>
    );
  }

  // Calculate points for the polyline with padding
  const points = values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * drawWidth;
      const y = padding + drawHeight - (value / 100) * drawHeight;
      return `${x},${y}`;
    })
    .join(" ");

  // Create gradient for better visual
  const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={width}
      height={height}
      className={cn("inline-block", className)}
      aria-label={`Pass rate trend: ${values.join("%, ")}%`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(147, 197, 253)" />
          <stop offset="100%" stopColor="rgb(59, 130, 246)" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot to emphasize the latest value */}
      <circle
        cx={padding + drawWidth}
        cy={padding + drawHeight - (values[values.length - 1] / 100) * drawHeight}
        r={dotRadius}
        className="fill-blue-500"
      />
    </svg>
  );
}
