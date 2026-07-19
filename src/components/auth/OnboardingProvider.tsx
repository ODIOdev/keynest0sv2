"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BUSINESS_STEPS,
  EMPTY_DRAFT,
  ONBOARDING,
  PERSONAL_STEPS,
  type OnboardingDraft,
} from "@/lib/onboarding";

const STORAGE_KEY = "keynest_onboarding_draft";

type Ctx = {
  email: string;
  accountType: string;
  isBusiness: boolean;
  draft: OnboardingDraft;
  patch: (partial: Partial<OnboardingDraft>) => void;
  steps: typeof BUSINESS_STEPS | typeof PERSONAL_STEPS;
  stepIndex: number;
  goNext: () => void;
  goBack: () => void;
};

const OnboardingContext = createContext<Ctx | null>(null);

export function OnboardingProvider({
  email,
  fullName,
  accountType,
  children,
}: {
  email: string;
  fullName: string;
  accountType: string | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isBusiness = accountType === "business" || !accountType;
  const steps = isBusiness ? BUSINESS_STEPS : PERSONAL_STEPS;

  const [draft, setDraft] = useState<OnboardingDraft>(() => ({
    ...EMPTY_DRAFT,
    full_name: fullName || "",
  }));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
        setDraft((d) => ({
          ...d,
          ...parsed,
          full_name: parsed.full_name || fullName || d.full_name,
        }));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [fullName]);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const stepIndex = Math.max(
    0,
    steps.findIndex((s) => s.path === pathname),
  );

  const patch = useCallback((partial: Partial<OnboardingDraft>) => {
    setDraft((d) => ({ ...d, ...partial }));
  }, []);

  const goNext = useCallback(() => {
    const next = steps[stepIndex + 1];
    if (next) router.push(next.path);
  }, [router, stepIndex, steps]);

  const goBack = useCallback(() => {
    const prev = steps[stepIndex - 1];
    if (prev) router.push(prev.path);
    else router.push(ONBOARDING.account);
  }, [router, stepIndex, steps]);

  // Keep non-business users off business-only routes
  useEffect(() => {
    if (!hydrated) return;
    if (isBusiness) return;
    const businessOnly = new Set<string>([
      ONBOARDING.business,
      ONBOARDING.industry,
      ONBOARDING.plan,
      ONBOARDING.branding,
      ONBOARDING.team,
    ]);
    if (businessOnly.has(pathname)) {
      router.replace(ONBOARDING.account);
    }
  }, [hydrated, isBusiness, pathname, router]);

  const value = useMemo(
    () => ({
      email,
      accountType: accountType || "business",
      isBusiness,
      draft,
      patch,
      steps,
      stepIndex,
      goNext,
      goBack,
    }),
    [
      email,
      accountType,
      isBusiness,
      draft,
      patch,
      steps,
      stepIndex,
      goNext,
      goBack,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}

export function clearOnboardingDraft() {
  sessionStorage.removeItem(STORAGE_KEY);
}
