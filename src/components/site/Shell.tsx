"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeynestLogo } from "@/components/site/KeynestLogo";
import { HashScroll, SiteNav, ScrollLink } from "@/components/site/SmoothNav";
import { createClient } from "@/lib/supabase/client";

const FOOTER_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/properties", label: "Properties" },
  { href: "/sell", label: "Sell" },
  { href: "/contact", label: "Contact" },
];

function HeaderAuthActions({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setAuthed(Boolean(data.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuthed(false);
    onNavigate?.();
    router.refresh();
    router.push("/");
  }

  if (authed === null) {
    return <div className="site-header__auth" aria-hidden />;
  }

  if (authed) {
    return (
      <div className="site-header__auth">
        <Link
          href="/dashboard"
          className="site-header__text-btn"
          onClick={onNavigate}
        >
          Admin
        </Link>
        <span className="site-header__auth-sep" aria-hidden>
          |
        </span>
        <button
          type="button"
          className="site-header__text-btn"
          onClick={() => void logout()}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="site-header__auth">
      <Link
        href="/auth/sign-in"
        className="site-header__signin"
        onClick={onNavigate}
      >
        Sign in
      </Link>
      <Link
        href="/auth/sign-up"
        className="site-header__signup"
        onClick={onNavigate}
      >
        Sign up
      </Link>
    </div>
  );
}

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

        <Suspense fallback={<nav className="site-header__nav" aria-hidden />}>
          <SiteNav className="site-header__nav" />
        </Suspense>

        <div className="site-header__actions">
          <div className="site-header__auth-desktop">
            <HeaderAuthActions />
          </div>
          <button
            type="button"
            className="site-header__menu-btn"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg
                className="site-header__menu-icon"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                className="site-header__menu-icon"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <path
                  d="M4 6h12M4 10h12M4 14h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div className="site-header__drawer">
          <Suspense fallback={null}>
            <SiteNav
              className="site-header__drawer-nav"
              onNavigate={() => setOpen(false)}
            />
          </Suspense>
          <div className="site-header__drawer-auth">
            <HeaderAuthActions onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#0c0407] text-white">
      <div className="px-8 py-16 sm:px-12 md:px-16">
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <KeynestLogo className="kn-logo--on-dark" size="md" />
            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              Curated homes, trusted agents, and a clearer path from first tour to
              keys — built for modern brokers and buyers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:contents">
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
                  <Link href="/properties?type=sell">Buy</Link>
                </li>
                <li>
                  <Link href="/properties?type=rent">Rent</Link>
                </li>
                <li>
                  <Link href="/sell">Sell</Link>
                </li>
                <li>
                  <Link href="/dashboard/properties">Upload portal</Link>
                </li>
              </ul>
            </div>
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
      </div>
      <div className="border-t border-white/10 px-8 py-6 sm:px-12 md:px-16">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-between gap-3 text-sm text-white/50 sm:flex-row">
          <p>© KeyNestOS. All rights reserved.</p>
          <nav className="flex items-center gap-3" aria-label="Legal">
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
            <span aria-hidden>|</span>
            <Link href="/faq" className="hover:text-white">
              FAQ
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
