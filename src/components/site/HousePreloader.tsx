"use client";

import { useId } from "react";

type HousePreloaderProps = {
  className?: string;
  size?: number;
  showLabel?: boolean;
};

// Left edge of chimney opening in the 64x64 viewBox of house-preloader.png
const CHIMNEY_LEFT = 22;
const CHIMNEY_TOP = 5.5;

const SMOKE_PUFFS = [
  "M0 0c-1.8-1-3.6-2.6-4.4-4.8 1.4 1 2.8 1.6 4.2 1.2 1.4-1.2 2.8-2.6 3.8-4.4 0.8 1.8 2 3.4 3.6 4.6-1.2 1-2.6 2-4 2.8-1.2 0.8-2.2 1-2.2 1.6z",
  "M0 0c-2-1.2-4.2-2.8-5.2-5.2 1.6 1.1 3.2 1.7 4.8 1.2 1.6-1.4 3.2-3 4.4-5 1 2.2 2.4 4 4.2 5.2-1.4 1.1-3 2.1-4.6 3-1.4 1-2.6 1.2-2.6 1.8z",
  "M0 0c-1.6-0.9-3.4-2.4-4.2-4.4 1.2 0.9 2.4 1.4 3.6 1 1.2-1.1 2.4-2.3 3.2-3.8 0.7 1.6 1.7 3 3 4-1.1 0.9-2.3 1.7-3.5 2.5-1 0.7-1.9 0.9-1.9 1.4z",
];

export function HousePreloader({
  className = "",
  size = 56,
  showLabel = true,
}: HousePreloaderProps) {
  const reactId = useId().replace(/:/g, "");
  const gradientId = `house-smoke-gradient-${reactId}`;

  return (
    <div
      className={`house-preloader-stack ${className}`.trim()}
      role="status"
      aria-label="Loading OS"
    >
      <div
        className="house-preloader"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <div className="house-preloader-icon" />
        <svg
          className="house-preloader-smoke-layer"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="45%" stopColor="#00b8db" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
          <g
            className="house-preloader-smoke"
            transform={`translate(${CHIMNEY_LEFT} ${CHIMNEY_TOP})`}
            fill={`url(#${gradientId})`}
          >
            {SMOKE_PUFFS.map((d, index) => (
              <g key={index} className="house-preloader-smoke-puff">
                <path d={d} />
              </g>
            ))}
          </g>
        </svg>
      </div>
      {showLabel ? (
        <p className="house-preloader-status" aria-hidden="true">
          <span className="house-preloader-loading">loading</span>
          <span className="house-preloader-os">OS</span>
        </p>
      ) : null}
    </div>
  );
}
