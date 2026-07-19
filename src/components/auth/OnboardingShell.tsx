"use client";

import type { ReactNode } from "react";
import { useOnboarding } from "@/components/auth/OnboardingProvider";
import { KeynestLogo } from "@/components/site/KeynestLogo";

export function OnboardingShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { email, steps, stepIndex } = useOnboarding();

  return (
    <div className="auth-card space-y-5">
      <div>
        <KeynestLogo size="sm" className="mb-3 inline-flex" />
        <p className="text-sm uppercase tracking-wide text-[#758696]">
          Onboarding
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#0c0407]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[#758696]">
          Step {stepIndex + 1} of {steps.length} · {email}
        </p>
      </div>

      <ol className="onboard-progress" aria-label="Onboarding progress">
        {steps.map((step, i) => {
          const state =
            i < stepIndex ? "done" : i === stepIndex ? "current" : "upcoming";
          return (
            <li key={step.key} className={`onboard-progress__item is-${state}`}>
              <span className="onboard-progress__dot" aria-hidden />
              <span className="onboard-progress__label">{step.label}</span>
            </li>
          );
        })}
      </ol>

      {children}
    </div>
  );
}

export function OnboardingActions({
  onBack,
  onContinue,
  continueLabel = "Continue",
  loading = false,
  disabled = false,
}: {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  loading?: boolean;
  disabled?: boolean;
}) {
  const { goBack, stepIndex } = useOnboarding();

  return (
    <div className="flex gap-2">
      {stepIndex > 0 ? (
        <button
          type="button"
          className="btn-secondary"
          onClick={onBack || goBack}
          disabled={loading}
        >
          Back
        </button>
      ) : null}
      <button
        type="button"
        className="btn-primary flex-1"
        onClick={onContinue}
        disabled={loading || disabled}
      >
        {loading ? "Saving…" : continueLabel}
      </button>
    </div>
  );
}
