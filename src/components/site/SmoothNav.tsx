"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { navLinks } from "@/lib/nav";
import {
  buildPropertiesHref,
  navKindFromHref,
} from "@/lib/listing-params";
import { useSmoothScroll } from "@/components/site/SmoothScrollProvider";
import { ChatNavButton } from "@/components/site/ChatWidget";

function hashId(href: string) {
  const hash = href.split("#")[1];
  return hash || null;
}

export const ScrollLink = forwardRef<
  HTMLAnchorElement,
  {
    href: string;
    className?: string;
    children: ReactNode;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
  }
>(function ScrollLink(
  { href, className, children, onClick: onClickProp, onMouseEnter, onFocus, onBlur },
  ref,
) {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollToId } = useSmoothScroll();
  const id = hashId(href);

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    onClickProp?.();

    if (!id) return;

    if (pathname === "/") {
      e.preventDefault();
      scrollToId(id);
      window.history.replaceState(null, "", href);
      return;
    }

    e.preventDefault();
    router.push(href);
  }

  return (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      className={className}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {children}
    </Link>
  );
});

function linkIsActive(
  href: string,
  pathname: string,
  searchParams: URLSearchParams,
) {
  const [pathWithHash, query = ""] = href.split("?");
  const path = pathWithHash.split("#")[0] || "/";

  if (path === "/") {
    return pathname === "/";
  }

  if (pathname !== path) return false;

  if (!query) {
    // Bare path (e.g. Listings) — active only when no listing-type filter is set
    return !searchParams.get("type");
  }

  const wanted = new URLSearchParams(query);
  for (const [key, value] of wanted.entries()) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

/** Resolve Buy/Rent/Listings hrefs so they keep location & filters when already searching. */
function usePropertiesNavHref(href: string) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kind = navKindFromHref(href);
  if (!kind) return href;
  if (pathname !== "/properties") {
    if (kind === "buy") return "/properties?type=sell";
    if (kind === "rent") return "/properties?type=rent";
    return "/properties";
  }
  return buildPropertiesHref(searchParams, {
    type: kind === "buy" ? "sell" : kind === "rent" ? "rent" : null,
  });
}

const PropertiesNavLink = forwardRef<
  HTMLAnchorElement,
  {
    href: string;
    className?: string;
    children: ReactNode;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    "aria-current"?: "page" | undefined;
  }
>(function PropertiesNavLink(
  {
    href,
    className,
    children,
    onClick,
    onMouseEnter,
    onFocus,
    onBlur,
    "aria-current": ariaCurrent,
  },
  ref,
) {
  const resolved = usePropertiesNavHref(href);
  return (
    <Link
      ref={ref}
      href={resolved}
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-current={ariaCurrent}
      scroll={false}
    >
      {children}
    </Link>
  );
});

type Mask = { x: number; y: number; w: number; h: number; visible: boolean };

const HOME_LINK = { href: "/#home", label: "Home" } as const;

/** Smooth-scroll nav links to homepage sections */
export function SiteNav({
  className,
  onNavigate,
  includeHome = false,
}: {
  className?: string;
  onNavigate?: () => void;
  /** Prefixed Home link — used in the mobile drawer only */
  includeHome?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mask, setMask] = useState<Mask>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    visible: false,
  });
  const maskReady = useRef(false);
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const prevRouteKey = useRef(routeKey);

  const links = includeHome ? [HOME_LINK, ...navLinks] : navLinks;

  const activeIndex = links.findIndex((link) =>
    "action" in link && link.action === "chat"
      ? false
      : linkIsActive(link.href, pathname, searchParams),
  );

  const moveMaskTo = useCallback((index: number | null, instant = false) => {
    const nav = navRef.current;
    const el = index === null ? null : itemRefs.current[index];
    if (!nav || !el) {
      setMask({ x: 0, y: 0, w: 0, h: 0, visible: false });
      return;
    }
    const navBox = nav.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    // Skip bogus measurements (hidden / not laid out yet)
    if (box.width < 2 || box.height < 2) {
      setMask({ x: 0, y: 0, w: 0, h: 0, visible: false });
      return;
    }
    const next = {
      x: box.left - navBox.left,
      y: box.top - navBox.top,
      w: box.width,
      h: box.height,
      visible: true,
    };

    if (instant || !maskReady.current) {
      maskReady.current = true;
      const maskEl = nav.querySelector<HTMLElement>(".site-header__mask");
      if (maskEl) {
        maskEl.style.transition = "none";
        setMask(next);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (maskEl) maskEl.style.transition = "";
          });
        });
        return;
      }
    }
    setMask(next);
  }, []);

  // Overlay follows pointer / focus; falls back to active route when idle
  useLayoutEffect(() => {
    const target = hoverIndex ?? (activeIndex >= 0 ? activeIndex : null);
    const routeChanged = prevRouteKey.current !== routeKey;
    prevRouteKey.current = routeKey;
    moveMaskTo(target, routeChanged);
  }, [hoverIndex, activeIndex, moveMaskTo, routeKey, links.length]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const sync = () => {
      const target = hoverIndex ?? (activeIndex >= 0 ? activeIndex : null);
      moveMaskTo(target, true);
    };

    window.addEventListener("resize", sync);
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => sync())
        : null;
    ro?.observe(nav);

    return () => {
      window.removeEventListener("resize", sync);
      ro?.disconnect();
    };
  }, [hoverIndex, activeIndex, moveMaskTo]);

  return (
    <nav
      ref={navRef}
      className={className}
      aria-label="Primary"
      onMouseLeave={() => setHoverIndex(null)}
    >
      <span
        className={`site-header__mask${mask.visible ? " is-on" : ""}`}
        aria-hidden
        style={{
          transform: `translate3d(${mask.x}px, ${mask.y}px, 0)`,
          width: mask.w,
          height: mask.h,
        }}
      />
      {links.map((link, index) => {
        const active =
          "action" in link && link.action === "chat"
            ? false
            : linkIsActive(link.href, pathname, searchParams);
        const classes = `site-header__link${active ? " is-active" : ""}`;
        const setRef = (node: HTMLAnchorElement | null) => {
          itemRefs.current[index] = node;
        };
        const shared = {
          className: classes,
          onMouseEnter: () => setHoverIndex(index),
          onFocus: () => setHoverIndex(index),
          onBlur: () => setHoverIndex(null),
        };

        if ("action" in link && link.action === "chat") {
          return (
            <ChatNavButton
              key={link.label}
              setRef={setRef}
              {...shared}
            />
          );
        }

        const isPropertiesNav = navKindFromHref(link.href) !== null;

        if (isPropertiesNav) {
          return (
            <PropertiesNavLink
              key={link.label}
              ref={setRef}
              href={link.href}
              {...shared}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
            >
              <span>{link.label}</span>
            </PropertiesNavLink>
          );
        }

        return link.href.includes("#") ? (
          <ScrollLink
            key={link.label}
            ref={setRef}
            href={link.href}
            {...shared}
            onClick={onNavigate}
          >
            <span>{link.label}</span>
          </ScrollLink>
        ) : (
          <Link
            key={link.label}
            ref={setRef}
            href={link.href}
            {...shared}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
          >
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** After navigating to `/#section`, scroll once the page is ready */
export function HashScroll() {
  const pathname = usePathname();
  const { scrollToId } = useSmoothScroll();

  useEffect(() => {
    if (pathname !== "/") return;

    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const tryScroll = () => scrollToId(hash);
    const t1 = window.setTimeout(tryScroll, 80);
    const t2 = window.setTimeout(tryScroll, 350);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname, scrollToId]);

  return null;
}
