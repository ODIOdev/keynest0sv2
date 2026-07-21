"use client";

import { useBrand } from "@/components/site/BrandProvider";
import { SiteFooterClient } from "@/components/site/SiteFooterClient";

/** Footer reads socials from BrandProvider (loaded once in the root layout). */
export function SiteFooter() {
  const { socialLinks } = useBrand();
  return <SiteFooterClient socialLinks={socialLinks} />;
}
