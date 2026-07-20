"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { SiteScrollAwayFades } from "@/components/site/SiteScrollAwayFades";

type ScrollApi = {
  scrollToId: (id: string) => boolean;
};

const ScrollContext = createContext<ScrollApi>({
  scrollToId: () => false,
});

export function useSmoothScroll() {
  return useContext(ScrollContext);
}

function getSiteCard() {
  return document.querySelector(".site-card") as HTMLElement | null;
}

function scrollCardTo(top: number, smooth = true) {
  const card = getSiteCard();
  if (card) {
    card.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
    return true;
  }
  window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  return false;
}

function NativeScrollApiProvider({ children }: { children: ReactNode }) {
  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return false;

    const card = getSiteCard();
    if (card) {
      const cardRect = card.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const top = elRect.top - cardRect.top + card.scrollTop - 88;
      card.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return true;
  }, []);

  return (
    <ScrollContext.Provider value={{ scrollToId }}>
      {children}
    </ScrollContext.Provider>
  );
}

function LenisScrollApiProvider({ children }: { children: ReactNode }) {
  const lenis = useLenis();

  const scrollToId = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return false;

      if (lenis) {
        lenis.scrollTo(el, { offset: -88, duration: 1.15 });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return true;
    },
    [lenis],
  );

  return (
    <ScrollContext.Provider value={{ scrollToId }}>
      {children}
    </ScrollContext.Provider>
  );
}

function CardRouteScrollReset() {
  const pathname = usePathname();
  const skipRef = useRef(true);

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    if (pathname === "/" && typeof window !== "undefined" && window.location.hash) {
      return;
    }
    scrollCardTo(0, false);
  }, [pathname]);

  return null;
}

/** Keep Lenis scroll in sync with Next.js path navigations (e.g. Back to listings). */
function LenisRouteScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();
  const skipRef = useRef(true);

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    if (pathname === "/" && typeof window !== "undefined" && window.location.hash) {
      return;
    }
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  return null;
}

function isCardShellPath(pathname: string) {
  return !(
    pathname.startsWith("/auth") || pathname.startsWith("/onboarding")
  );
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const cardShell = isCardShellPath(pathname);

  useEffect(() => {
    if (cardShell) {
      document.documentElement.classList.remove("lenis");
      return;
    }
    document.documentElement.classList.add("lenis");
    return () => document.documentElement.classList.remove("lenis");
  }, [cardShell]);

  // Marketing + dashboard: scroll inside the masked site card (no root Lenis).
  if (cardShell) {
    return (
      <NativeScrollApiProvider>
        <CardRouteScrollReset />
        <SiteScrollAwayFades />
        {children}
      </NativeScrollApiProvider>
    );
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.1,
      }}
    >
      <LenisScrollApiProvider>
        <LenisRouteScrollReset />
        <SiteScrollAwayFades />
        {children}
      </LenisScrollApiProvider>
    </ReactLenis>
  );
}
