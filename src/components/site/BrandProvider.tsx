"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ProfileSocialLink } from "@/lib/auth-types";

type BrandContextValue = {
  brandName: string;
  brandLogo: string | null;
  socialLinks: ProfileSocialLink[];
};

const BrandContext = createContext<BrandContextValue>({
  brandName: "KeyNestOS",
  brandLogo: null,
  socialLinks: [],
});

export function BrandProvider({
  brandName,
  brandLogo,
  socialLinks = [],
  children,
}: {
  brandName: string;
  brandLogo?: string | null;
  socialLinks?: ProfileSocialLink[];
  children: ReactNode;
}) {
  return (
    <BrandContext.Provider
      value={{
        brandName: brandName || "KeyNestOS",
        brandLogo: brandLogo?.trim() ? brandLogo.trim() : null,
        socialLinks: Array.isArray(socialLinks) ? socialLinks : [],
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
