"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type MouseEvent, type ReactNode } from "react";
import { navLinks } from "@/lib/nav";
import { useSmoothScroll } from "@/components/site/SmoothScrollProvider";

function hashId(href: string) {
  const hash = href.split("#")[1];
  return hash || null;
}

export function ScrollLink({
  href,
  className,
  children,
  onClick: onClickProp,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
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
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

/** Smooth-scroll nav links to homepage sections */
export function SiteNav({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const links = navLinks.filter(
    (link) => !(pathname === "/" && link.label === "Home"),
  );

  return (
    <nav className={className}>
      {links.map((link) =>
        link.href.includes("#") ? (
          <ScrollLink
            key={link.label}
            href={link.href}
            className="site-header__link"
            onClick={onNavigate}
          >
            {link.label}
          </ScrollLink>
        ) : (
          <Link
            key={link.label}
            href={link.href}
            className="site-header__link"
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        ),
      )}
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
