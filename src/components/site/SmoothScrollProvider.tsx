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

function ScrollApiProvider({ children }: { children: ReactNode }) {
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

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("lenis");
    return () => document.documentElement.classList.remove("lenis");
  }, []);

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
      <ScrollApiProvider>
        <LenisRouteScrollReset />
        <SiteScrollAwayFades />
        {children}
      </ScrollApiProvider>
    </ReactLenis>
  );
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
    // Hash deep-links on home are handled by HashScroll
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
