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

  // Handle single value - show a horizontal line
  if (values.length === 1) {
    const y = height - (values[0] / 100) * height;
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
          r={2}
          className="fill-blue-500"
        />
      </svg>
    );
  }

  // Calculate points for the polyline
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (value / 100) * height;
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
        cx={width}
        cy={height - (values[values.length - 1] / 100) * height}
        r={2.5}
        className="fill-blue-500"
      />
    </svg>
  );
}
