"use client";

import Link from "next/link";
import { KeynestLogo } from "@/components/site/KeynestLogo";
import { SocialPlatformIcon } from "@/components/site/SocialPlatformIcon";
import { ScrollLink } from "@/components/site/SmoothNav";
import { socialProfileUrl } from "@/lib/social-links";
import type { ProfileSocialLink } from "@/lib/auth-types";

const FOOTER_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/properties", label: "Properties" },
  { href: "/sell", label: "Sell" },
  { href: "/contact", label: "Contact" },
];

function resolveSocials(socialLinks: ProfileSocialLink[]) {
  return socialLinks
    .map((item) => {
      const href = socialProfileUrl(item.platform, item.handle);
      if (!href) return null;
      return { ...item, href };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function SiteFooterClient({
  socialLinks = [],
}: {
  socialLinks?: ProfileSocialLink[];
}) {
  const publicSocials = resolveSocials(
    Array.isArray(socialLinks) ? socialLinks : [],
  );

  return (
    <footer className="bg-[#0c0407] text-white">
      <div className="px-8 py-16 sm:px-12 md:px-16">
        <div
          className={`mx-auto grid w-full max-w-[1400px] gap-10 ${
            publicSocials.length > 0
              ? "md:grid-cols-[1.2fr_1fr_1fr_1fr]"
              : "md:grid-cols-[1.2fr_1fr_1fr]"
          }`}
        >
          <div className="space-y-5">
            <KeynestLogo className="kn-logo--on-dark" size="md" />
            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              Curated homes, trusted agents, and a clearer path from first tour to
              keys — built for modern brokers and buyers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:contents">
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                Pages
              </h4>
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
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                CMS
              </h4>
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
          {publicSocials.length > 0 ? (
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                Social
              </h4>
              <ul className="site-footer-social">
                {publicSocials.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className="site-footer-social__link"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.platform} (${item.handle})`}
                    >
                      <SocialPlatformIcon
                        platform={item.platform}
                        className="site-footer-social__icon"
                      />
                      <span>{item.platform}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
