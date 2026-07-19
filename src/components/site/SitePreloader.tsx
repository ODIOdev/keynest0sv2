"use client";

import { useEffect, useRef, useState } from "react";
import { HousePreloader } from "@/components/site/HousePreloader";
import { KeynestLogo } from "@/components/site/KeynestLogo";

const BOOT_MIN_MS = 1400;
const EXIT_MS = 520;

/** Full-screen boot overlay only — not on client navigations (those felt broken). */
export function SitePreloader() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    const started = Date.now();
    let finished = false;

    const beginExit = () => {
      if (finished) return;
      finished = true;
      const wait = Math.max(0, BOOT_MIN_MS - (Date.now() - started));
      const t1 = window.setTimeout(() => {
        setExiting(true);
        const t2 = window.setTimeout(() => {
          setVisible(false);
          setExiting(false);
        }, EXIT_MS);
        timers.push(t2);
      }, wait);
      timers.push(t1);
    };

    if (document.readyState === "complete") {
      beginExit();
    } else {
      window.addEventListener("load", beginExit, { once: true });
      const safety = window.setTimeout(beginExit, BOOT_MIN_MS + 2500);
      timers.push(safety);
    }

    return () => {
      window.removeEventListener("load", beginExit);
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`site-preloader${exiting ? " is-exiting" : ""}`}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="site-preloader__content">
        <KeynestLogo size="lg" className="site-preloader__logo" />
        <p className="site-preloader__tagline">
          Unlock connections. Open opportunities.
        </p>
        <HousePreloader className="site-preloader__house" size={64} />
      </div>
    </div>
  );
}
