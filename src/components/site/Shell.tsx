"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeynestLogo } from "@/components/site/KeynestLogo";
import { HashScroll, SiteNav, ScrollLink } from "@/components/site/SmoothNav";
import { createClient } from "@/lib/supabase/client";

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
