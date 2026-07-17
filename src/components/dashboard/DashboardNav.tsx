"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/leads", label: "Leads CRM" },
  { href: "/dashboard/properties", label: "Properties" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/media", label: "Image uploads" },
  { href: "/dashboard/agents", label: "Agents" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <aside className="dash-nav">
      <div className="mb-8 px-2">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">KeyNestOS</p>
        <h1 className="text-xl font-semibold">Broker CRM</h1>
      </div>
      {links.map((link) => {
        const active =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-3 py-2.5 text-sm transition ${
              active ? "bg-white text-[#0c0407]" : "text-white/75 hover:bg-white/10"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <div className="mt-auto space-y-2 pt-8">
        <Link
          href="/"
          className="block rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/10"
        >
          View website
        </Link>
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-white/75 hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
