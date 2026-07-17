"use client";

import { ReactLenis, useLenis } from "lenis/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react";

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
        lerp: 0.08,
        smoothWheel: true,
        syncTouch: false,
        anchors: false,
      }}
    >
      <ScrollApiProvider>{children}</ScrollApiProvider>
    </ReactLenis>
  );
}
