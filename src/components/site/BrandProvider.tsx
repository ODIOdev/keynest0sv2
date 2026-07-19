"use client";

import { createContext, useContext, type ReactNode } from "react";

type BrandContextValue = {
  brandName: string;
  brandLogo: string | null;
};

const BrandContext = createContext<BrandContextValue>({
  brandName: "KeyNestOS",
  brandLogo: null,
});

export function BrandProvider({
  brandName,
  brandLogo,
  children,
}: {
  brandName: string;
  brandLogo?: string | null;
  children: ReactNode;
}) {
  return (
    <BrandContext.Provider
      value={{
        brandName: brandName || "KeyNestOS",
        brandLogo: brandLogo?.trim() ? brandLogo.trim() : null,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
