"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type FadeItem = {
  section: HTMLElement;
  fade: HTMLDivElement;
  top: number;
  height: number;
  last: number;
};

function isScrollFadePath(pathname: string) {
  // Long multi-section home only — single-section pages (sell, contact, etc.)
  // look washed-out / broken when the whole main fades.
  return pathname === "/";
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

function getScrollRoot(): HTMLElement | Window {
  return (
    (document.querySelector(".site-card") as HTMLElement | null) ?? window
  );
}

function scrollYOf(root: HTMLElement | Window) {
  return root instanceof Window ? root.scrollY || 0 : root.scrollTop;
}

function elementTopInRoot(el: HTMLElement, root: HTMLElement | Window) {
  const elRect = el.getBoundingClientRect();
  if (root instanceof Window) {
    return elRect.top + (window.scrollY || 0);
  }
  const rootRect = root.getBoundingClientRect();
  return elRect.top - rootRect.top + root.scrollTop;
}

function measure(item: FadeItem, root: HTMLElement | Window) {
  item.top = elementTopInRoot(item.section, root);
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

    if (!isScrollFadePath(pathname)) return;

    const cssMode = supportsScrollTimeline();
    cssModeRef.current = cssMode;
    const root = getScrollRoot();

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
        measure(item, root);
        applyOpacity(item, scrollYOf(root));
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

    const onScroll = () => {
      frameRef.current += 1;
      const remasure = frameRef.current % 20 === 0;
      const scroll = scrollYOf(root);
      for (const item of itemsRef.current) {
        if (remasure) measure(item, root);
        applyOpacity(item, scroll);
      }
    };

    const onResize = () => {
      for (const item of itemsRef.current) {
        measure(item, root);
        applyOpacity(item, scrollYOf(root));
      }
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      itemsRef.current.forEach(({ fade, section }) => {
        fade.remove();
        section.classList.remove("has-scroll-fade");
      });
      itemsRef.current = [];
    };
  }, [pathname]);

  return null;
}
