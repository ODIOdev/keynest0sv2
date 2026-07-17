"use client";

import Link from "next/link";
import { useState } from "react";
import { KeynestLogo } from "@/components/site/KeynestLogo";
import { HashScroll, SiteNav, ScrollLink } from "@/components/site/SmoothNav";

const FOOTER_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About Us" },
  { href: "/#properties", label: "Properties" },
  { href: "/#properties", label: "Buy" },
  { href: "/#properties", label: "Rent" },
  { href: "/#contact", label: "Sell" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <HashScroll />
      <div className="site-header__bar">
        <ScrollLink
          href="/#home"
          className="site-header__brand"
          onClick={() => setOpen(false)}
        >
          <KeynestLogo size="md" />
        </ScrollLink>

        <SiteNav className="site-header__nav" />

        <div className="site-header__actions">
          <button
            type="button"
            className="site-header__menu-btn"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {open ? (
        <div className="site-header__drawer">
          <SiteNav
            className="site-header__drawer-nav"
            onNavigate={() => setOpen(false)}
          />
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#0c0407] text-white">
      <div className="container-wide grid gap-10 py-16 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="space-y-5">
          <KeynestLogo className="kn-logo--on-dark" size="md" />
          <p className="max-w-sm text-sm leading-relaxed text-white/70">
            Curated homes, trusted agents, and a clearer path from first tour to
            keys — built for modern brokers and buyers.
          </p>
          <div className="flex flex-col items-start gap-3">
            <ScrollLink href="/#contact" className="btn-white">
              Contact us
            </ScrollLink>
            <Link
              href="/sign-in"
              className="text-sm text-white/55 transition-colors hover:text-white"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">Pages</h4>
          <ul className="space-y-3 text-sm text-white/70">
            {FOOTER_LINKS.map((l) => (
              <li key={l.label}>
                {l.href.startsWith("/#") ? (
                  <ScrollLink href={l.href} className="hover:text-white">
                    {l.label}
                  </ScrollLink>
                ) : (
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">CMS</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li>
              <ScrollLink href="/#properties">Properties</ScrollLink>
            </li>
            <li>
              <ScrollLink href="/#properties">Buy</ScrollLink>
            </li>
            <li>
              <ScrollLink href="/#properties">Rent</ScrollLink>
            </li>
            <li>
              <ScrollLink href="/#contact">Sell</ScrollLink>
            </li>
            <li>
              <Link href="/dashboard/properties">Upload portal</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">Social</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li>Facebook</li>
            <li>Instagram</li>
            <li>Twitter</li>
            <li>LinkedIn</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-white/50">
        © KeyNestOS. All rights reserved.
      </div>
    </footer>
  );
}
