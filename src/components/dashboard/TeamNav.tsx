"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TEAM_NAV } from "@/lib/team";

export function TeamNav() {
  const pathname = usePathname();

  return (
    <nav className="settings-nav" aria-label="Team">
      {TEAM_NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`settings-nav__link${active ? " is-active" : ""}`}
          >
            <span className="settings-nav__label">{item.label}</span>
            <span className="settings-nav__hint">{item.hint}</span>
          </Link>
        );
      })}
    </nav>
  );
}
