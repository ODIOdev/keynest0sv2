"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";

type FadeItem = {
  section: HTMLElement;
  fade: HTMLDivElement;
  top: number;
  height: number;
  last: number;
};

function isMarketingPath(pathname: string) {
  return !(
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    pathname === "/about" ||
    pathname.startsWith("/properties/")
  );
}

function isDarkSection(section: HTMLElement) {
  if (section.classList.contains("hero-modern")) return false;
  const cls = section.className;
  return (
    section.classList.contains("text-white") ||
    cls.includes("bg-[#0c0407]") ||
    cls.includes("bg-[#0C0407]")
  );
}

function collectTargets(): HTMLElement[] {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("main > section"),
  );
  if (sections.length > 0) return sections;
  const main = document.querySelector("main");
  return main instanceof HTMLElement ? [main] : [];
}

function supportsScrollTimeline() {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("animation-timeline: view()")
  );
}

function documentTop(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.top + (window.scrollY || 0);
}

function measure(item: FadeItem) {
  item.top = documentTop(item.section);
  item.height = item.section.offsetHeight;
}

function applyOpacity(item: FadeItem, scroll: number) {
  if (item.height < 64) {
    if (item.last !== 0) {
      item.fade.style.opacity = "0";
      item.last = 0;
    }
    return;
  }

  const progress = (scroll - item.top) / (item.height * 0.75);
  const next = progress <= 0 ? 0 : progress >= 1 ? 1 : progress;

  if (next === 0 || next === 1) {
    if (item.last !== next) {
      item.fade.style.opacity = String(next);
      item.last = next;
    }
    return;
  }

  if (Math.abs(next - item.last) < 0.015) return;
  item.fade.style.opacity = String(next);
  item.last = next;
}

/** Scroll-away fade overlays — prefers CSS scroll timelines (no per-frame JS). */
export function SiteScrollAwayFades() {
  const pathname = usePathname();
  const itemsRef = useRef<FadeItem[]>([]);
  const cssModeRef = useRef(false);
  const frameRef = useRef(0);

  useEffect(() => {
    itemsRef.current.forEach(({ fade, section }) => {
      fade.remove();
      section.classList.remove("has-scroll-fade");
    });
    itemsRef.current = [];
    cssModeRef.current = false;

    if (!isMarketingPath(pathname)) return;

    const cssMode = supportsScrollTimeline();
    cssModeRef.current = cssMode;

    itemsRef.current = collectTargets().map((section) => {
      section.classList.add("has-scroll-fade");
      const fade = document.createElement("div");
      fade.className = cssMode
        ? "section-scroll-fade section-scroll-fade--css"
        : "section-scroll-fade";
      fade.setAttribute("aria-hidden", "true");
      if (isDarkSection(section)) {
        fade.classList.add("section-scroll-fade--dark");
      }
      section.appendChild(fade);
      const item: FadeItem = {
        section,
        fade,
        top: 0,
        height: 0,
        last: -1,
      };
      if (!cssMode) {
        measure(item);
        applyOpacity(item, window.scrollY || 0);
      }
      return item;
    });

    if (cssMode) {
      return () => {
        itemsRef.current.forEach(({ fade, section }) => {
          fade.remove();
          section.classList.remove("has-scroll-fade");
        });
        itemsRef.current = [];
      };
    }

    const onResize = () => {
      for (const item of itemsRef.current) {
        measure(item);
        applyOpacity(item, window.scrollY || 0);
      }
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      itemsRef.current.forEach(({ fade, section }) => {
        fade.remove();
        section.classList.remove("has-scroll-fade");
      });
      itemsRef.current = [];
    };
  }, [pathname]);

  useLenis(({ scroll }) => {
    if (cssModeRef.current) return;

    frameRef.current += 1;
    // Remeasure every ~20 frames in case layout shifted
    const remasure = frameRef.current % 20 === 0;

    for (const item of itemsRef.current) {
      if (remasure) measure(item);
      applyOpacity(item, scroll);
    }
  });

  return null;
}
