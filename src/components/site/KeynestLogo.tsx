"use client";

import Image from "next/image";
import { useBrand } from "@/components/site/BrandProvider";

type KeynestLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Override context logo (pass null to force text wordmark). */
  imageSrc?: string | null;
};

export function KeynestLogo({
  className = "",
  size = "md",
  imageSrc,
}: KeynestLogoProps) {
  const brand = useBrand();
  const src = imageSrc === undefined ? brand.brandLogo : imageSrc;
  const label = brand.brandName || "KeyNestOS";

  if (src) {
    return (
      <span
        className={`kn-logo kn-logo--img kn-logo--${size} ${className}`.trim()}
        aria-label={label}
      >
        <Image
          src={src}
          alt={label}
          width={size === "lg" ? 220 : size === "sm" ? 120 : 160}
          height={size === "lg" ? 64 : size === "sm" ? 28 : 40}
          className="kn-logo__image"
          priority={size === "lg" || className.includes("kn-logo--hero")}
        />
      </span>
    );
  }

  return (
    <span
      className={`kn-logo kn-logo--${size} ${className}`.trim()}
      aria-label={label}
    >
      <span className="kn-logo__name">KeyNest</span>
      <span className="kn-logo__os">OS</span>
    </span>
  );
}
