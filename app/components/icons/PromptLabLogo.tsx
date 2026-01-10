interface PromptLabLogoProps {
  size?: number;
  className?: string;
}

export function PromptLabLogo({ size = 24, className = "" }: PromptLabLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Flask body - conical shape */}
      <path d="M9 2h6v4l4 12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1l4-12V2" />

      {/* Flask neck cap */}
      <path d="M9 2h6" />

      {/* Document/text lines inside flask representing prompt */}
      <path d="M8 13h8" />
      <path d="M9 16h6" />

      {/* Sparkle/improvement indicator at top */}
      <path d="M17 4l1-1m0 0l1 1m-1-1v2" />
    </svg>
  );
}
