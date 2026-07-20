"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function isAppShellPath(pathname: string) {
  return pathname.startsWith("/auth") || pathname.startsWith("/onboarding");
}

function isDashboardPath(pathname: string) {
  return pathname.startsWith("/dashboard");
}

export function SiteViewport({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isAppShellPath(pathname)) {
    return children;
  }

  const dashboard = isDashboardPath(pathname);

  return (
    <div
      className={`site-viewport${dashboard ? " site-viewport--dashboard" : ""}`}
    >
      <div
        className={`site-card${dashboard ? " site-card--dashboard" : ""}`}
        data-lenis-prevent
      >
        {children}
      </div>
    </div>
  );
}
