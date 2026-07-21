"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { KeynestLogo } from "@/components/site/KeynestLogo";

const groups = [
  {
    label: "Workspace",
    links: [
      { href: "/dashboard", label: "Overview", icon: "grid" },
      { href: "/dashboard/analytics", label: "Analytics", icon: "chart" },
      { href: "/dashboard/leads", label: "Leads", icon: "users" },
      { href: "/dashboard/messages", label: "Messages", icon: "message" },
      { href: "/dashboard/properties", label: "Properties", icon: "home" },
    ],
  },
  {
    label: "Catalog",
    links: [
      { href: "/dashboard/categories", label: "Categories", icon: "layers" },
      { href: "/dashboard/media", label: "Media", icon: "image" },
      { href: "/dashboard/agents", label: "Agents", icon: "badge" },
      { href: "/dashboard/web-manager", label: "Web Manager", icon: "globe" },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/dashboard/team", label: "Team", icon: "team" },
      { href: "/dashboard/settings", label: "Settings", icon: "gear" },
    ],
  },
] as const;

type NavIconName = (typeof groups)[number]["links"][number]["icon"];

function NavIcon({ name }: { name: NavIconName }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "grid":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "chart":
      return (
        <svg {...props}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 15v-4" />
          <path d="M12 15V8" />
          <path d="M16 15v-7" />
        </svg>
      );
    case "users":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "home":
      return (
        <svg {...props}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      );
    case "layers":
      return (
        <svg {...props}>
          <path d="m12 2 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5" />
          <path d="m3 17 9 5 9-5" />
        </svg>
      );
    case "image":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      );
    case "badge":
      return (
        <svg {...props}>
          <path d="M12 3 14.5 8.5 20.5 9.5 16 13.5 17.2 19.5 12 16.6 6.8 19.5 8 13.5 3.5 9.5 9.5 8.5 12 3Z" />
        </svg>
      );
    case "message":
      return (
        <svg {...props}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "globe":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18" />
          <path d="M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "team":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4 20c1.5-3.5 4.2-5 8-5s6.5 1.5 8 5" />
        </svg>
      );
    case "gear":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </svg>
      );
    default:
      return null;
  }
}

function currentNavLabel(pathname: string) {
  for (const group of groups) {
    for (const link of group.links) {
      const active =
        link.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(link.href);
      if (active) return link.label;
    }
  }
  return "Menu";
}

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const activeLabel = currentNavLabel(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/auth/sign-in");
    router.refresh();
  }

  return (
    <aside className={`dash-nav${open ? " is-open" : ""}`}>
      <div className="dash-nav__bar">
        <div className="dash-nav__brand">
          <KeynestLogo className="kn-logo--on-dark" size="lg" />
          <p className="dash-nav__eyebrow">Operations</p>
        </div>

        <button
          type="button"
          className="dash-nav__menu-btn"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="dash-nav__menu-btn-label">{activeLabel}</span>
          <svg
            className="dash-nav__menu-chevron"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      <div id={menuId} className="dash-nav__drawer">
        <nav className="dash-nav__groups" aria-label="Dashboard">
          {groups.map((group) => (
            <div key={group.label} className="dash-nav__group">
              <p className="dash-nav__group-label">{group.label}</p>
              {group.links.map((link) => {
                const active =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`dash-nav__link${active ? " is-active" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    <span className="dash-nav__icon" aria-hidden>
                      <NavIcon name={link.icon} />
                    </span>
                    <span className="dash-nav__label">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="dash-nav__footer">
          <Link
            href="/"
            className="dash-nav__link dash-nav__link--quiet"
            onClick={() => setOpen(false)}
          >
            <span className="dash-nav__icon" aria-hidden>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
              </svg>
            </span>
            <span className="dash-nav__label">View website</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="dash-nav__link dash-nav__link--quiet"
          >
            <span className="dash-nav__icon" aria-hidden>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </span>
            <span className="dash-nav__label">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
