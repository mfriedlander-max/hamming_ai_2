type PatternType = "dots" | "grid" | "diagonal";

interface BackgroundPatternProps {
  pattern?: PatternType;
  opacity?: number;
  color?: string;
  className?: string;
}

export function BackgroundPattern({
  pattern = "dots",
  opacity = 0.03,
  color = "currentColor",
  className = "",
}: BackgroundPatternProps) {
  const patterns = {
    dots: (
      <pattern
        id="dot-pattern"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="2" cy="2" r="1" fill={color} />
      </pattern>
    ),
    grid: (
      <pattern
        id="grid-pattern"
        x="0"
        y="0"
        width="32"
        height="32"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M0 32V.5H32"
          fill="none"
          stroke={color}
          strokeWidth="0.5"
        />
      </pattern>
    ),
    diagonal: (
      <pattern
        id="diagonal-pattern"
        x="0"
        y="0"
        width="40"
        height="40"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="40"
          stroke={color}
          strokeWidth="1"
        />
      </pattern>
    ),
  };

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="h-full w-full">
        <defs>{patterns[pattern]}</defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${pattern}-pattern)`}
        />
      </svg>
    </div>
  );
}
