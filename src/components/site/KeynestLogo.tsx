type KeynestLogoProps = {
  className?: string;
  size?: "sm" | "md";
};

export function KeynestLogo({ className = "", size = "md" }: KeynestLogoProps) {
  return (
    <span
      className={`kn-logo kn-logo--${size} ${className}`.trim()}
      aria-label="KeyNestOS"
    >
      <span className="kn-logo__name">KeyNest</span>
      <span className="kn-logo__os">OS</span>
    </span>
  );
}
