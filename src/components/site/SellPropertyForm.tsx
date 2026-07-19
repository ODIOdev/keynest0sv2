"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type Status = "idle" | "loading" | "ok" | "error";

const STEPS = [
  { id: 1, label: "Property" },
  { id: 2, label: "Details" },
  { id: 3, label: "Contact" },
] as const;

const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "other", label: "Other" },
] as const;

const GOALS = [
  {
    value: "sell",
    label: "Sell",
    hint: "Find a buyer and close",
  },
  {
    value: "rent",
    label: "Rent out",
    hint: "List for tenants",
  },
] as const;

export function SellPropertyForm() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [goal, setGoal] = useState<"sell" | "rent">("sell");
  const [propertyType, setPropertyType] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const [typeError, setTypeError] = useState(false);

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [step]);

  function goNext() {
    if (!formRef.current) return;
    const fields = formRef.current.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >(`[data-step="${step}"] [name]:not([type="hidden"])`);
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return;
      }
    }
    if (step === 1 && !propertyType) {
      setTypeError(true);
      return;
    }
    setTypeError(false);
    setStep((s) => Math.min(3, s + 1));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < 3) {
      goNext();
      return;
    }

    if (!formRef.current) return;
    const fields = formRef.current.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >(`[data-step="3"] [name]`);
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return;
      }
    }

    setStatus("loading");
    const form = new FormData(e.currentTarget);

    const address = String(form.get("address") || "");
    const city = String(form.get("city") || "");
    const state = String(form.get("state") || "");
    const zip = String(form.get("zip") || "");
    const price = String(form.get("price") || "");
    const bedrooms = String(form.get("bedrooms") || "");
    const bathrooms = String(form.get("bathrooms") || "");
    const sqft = String(form.get("sqft") || "");
    const notes = String(form.get("notes") || "");
    const timeline = String(form.get("timeline") || "");

    const message = [
      "Property onboarding request",
      `Goal: ${goal}`,
      `Address: ${address}, ${city}, ${state} ${zip}`.trim(),
      propertyType ? `Type: ${propertyType}` : null,
      price ? `Asking price: $${price}` : null,
      bedrooms ? `Bedrooms: ${bedrooms}` : null,
      bathrooms ? `Bathrooms: ${bathrooms}` : null,
      sqft ? `Sqft: ${sqft}` : null,
      timeline ? `Timeline: ${timeline}` : null,
      notes ? `Notes: ${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message,
        propertyId: null,
        source: "sell",
      }),
    });

    if (res.ok) {
      setStatus("ok");
      e.currentTarget.reset();
      setGoal("sell");
      setPropertyType("");
      setStep(1);
    } else {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="sell-form__success fade-up" role="status">
        <p className="sell-form__success-kicker">Submitted</p>
        <h2 className="sell-form__success-title">We&apos;ve got your property.</h2>
        <p className="sell-form__success-copy">
          An agent will review your details and reach out within one business
          day with next steps.
        </p>
        <div className="sell-form__success-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setStatus("idle")}
          >
            List another property
          </button>
          <Link href="/properties" className="btn-secondary">
            Browse listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="sell-form" noValidate>
      <div className="sell-form__progress" aria-label="Form progress">
        {STEPS.map((s) => {
          const state =
            s.id < step ? "done" : s.id === step ? "current" : "upcoming";
          return (
            <button
              key={s.id}
              type="button"
              className={`sell-form__step is-${state}`}
              aria-current={state === "current" ? "step" : undefined}
              disabled={s.id > step}
              onClick={() => {
                if (s.id < step) setStep(s.id);
              }}
            >
              <span className="sell-form__step-index">{s.id}</span>
              <span className="sell-form__step-label">{s.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sell-form__panel">
        <div
          data-step="1"
          className="sell-form__fields fade-up"
          hidden={step !== 1}
        >
          <div className="sell-form__section-head">
            <h2>Where is the property?</h2>
            <p>Start with the address and what you want to do.</p>
          </div>

          <fieldset className="sell-choice">
            <legend>I want to</legend>
            <div className="sell-choice__row">
              {GOALS.map((item) => (
                <label
                  key={item.value}
                  className={`sell-choice__card${goal === item.value ? " is-active" : ""}`}
                >
                  <input
                    type="radio"
                    name="listingGoal"
                    value={item.value}
                    checked={goal === item.value}
                    onChange={() => setGoal(item.value)}
                  />
                  <span className="sell-choice__title">{item.label}</span>
                  <span className="sell-choice__hint">{item.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span>Street address</span>
            <input
              name="address"
              required
              autoComplete="street-address"
              placeholder="123 Main Street"
              tabIndex={step === 1 ? undefined : -1}
            />
          </label>

          <div className="sell-form__grid sell-form__grid--3">
            <label className="field">
              <span>City</span>
              <input
                name="city"
                required
                autoComplete="address-level2"
                placeholder="City"
                tabIndex={step === 1 ? undefined : -1}
              />
            </label>
            <label className="field">
              <span>State</span>
              <input
                name="state"
                required
                autoComplete="address-level1"
                placeholder="CA"
                tabIndex={step === 1 ? undefined : -1}
              />
            </label>
            <label className="field">
              <span>ZIP</span>
              <input
                name="zip"
                required
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="94107"
                tabIndex={step === 1 ? undefined : -1}
              />
            </label>
          </div>

          <fieldset className="sell-choice" data-type-group>
            <legend>
              Property type
              {typeError ? (
                <span className="sell-choice__required">Pick one to continue</span>
              ) : null}
            </legend>
            <div className="sell-choice__chips">
              {PROPERTY_TYPES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`sell-chip${propertyType === item.value ? " is-active" : ""}`}
                  aria-pressed={propertyType === item.value}
                  tabIndex={step === 1 ? undefined : -1}
                  onClick={() => {
                    setPropertyType(item.value);
                    setTypeError(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div
          data-step="2"
          className="sell-form__fields fade-up"
          hidden={step !== 2}
        >
          <div className="sell-form__section-head">
            <h2>Tell us about the home</h2>
            <p>Rough numbers are fine — we&apos;ll refine them with you.</p>
          </div>

          <label className="field">
            <span>
              Asking price <em className="sell-optional">(optional)</em>
            </span>
            <div className="sell-input-affix">
              <span aria-hidden>$</span>
              <input
                name="price"
                type="number"
                min="0"
                step="1000"
                inputMode="numeric"
                placeholder="450,000"
                tabIndex={step === 2 ? undefined : -1}
              />
            </div>
          </label>

          <div className="sell-form__grid sell-form__grid--3">
            <label className="field">
              <span>Beds</span>
              <input
                name="bedrooms"
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="3"
                tabIndex={step === 2 ? undefined : -1}
              />
            </label>
            <label className="field">
              <span>Baths</span>
              <input
                name="bathrooms"
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                placeholder="2"
                tabIndex={step === 2 ? undefined : -1}
              />
            </label>
            <label className="field">
              <span>Sqft</span>
              <input
                name="sqft"
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="1,800"
                tabIndex={step === 2 ? undefined : -1}
              />
            </label>
          </div>

          <label className="field">
            <span>
              Timeline <em className="sell-optional">(optional)</em>
            </span>
            <select
              name="timeline"
              defaultValue=""
              tabIndex={step === 2 ? undefined : -1}
            >
              <option value="">When do you want to list?</option>
              <option value="asap">As soon as possible</option>
              <option value="30-days">Within 30 days</option>
              <option value="1-3-months">1–3 months</option>
              <option value="exploring">Just exploring</option>
            </select>
          </label>

          <label className="field">
            <span>
              Notes <em className="sell-optional">(optional)</em>
            </span>
            <textarea
              name="notes"
              placeholder="Renovations, HOA, preferred showing times…"
              tabIndex={step === 2 ? undefined : -1}
            />
          </label>
        </div>

        <div
          data-step="3"
          className="sell-form__fields fade-up"
          hidden={step !== 3}
        >
          <div className="sell-form__section-head">
            <h2>How can we reach you?</h2>
            <p>We&apos;ll follow up within one business day.</p>
          </div>

          <label className="field">
            <span>Full name</span>
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="Alex Rivera"
              tabIndex={step === 3 ? undefined : -1}
            />
          </label>

          <div className="sell-form__grid sell-form__grid--2">
            <label className="field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@email.com"
                tabIndex={step === 3 ? undefined : -1}
              />
            </label>
            <label className="field">
              <span>Phone</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="(555) 000-0000"
                tabIndex={step === 3 ? undefined : -1}
              />
            </label>
          </div>

          <p className="sell-form__privacy">
            By submitting, you agree we may contact you about this listing.
            Prefer to talk first?{" "}
            <Link href="/contact">Contact our team</Link>.
          </p>
        </div>
      </div>

      <div className="sell-form__actions">
        {step > 1 ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
        ) : (
          <span />
        )}

        {step < 3 ? (
          <button type="button" className="btn-primary" onClick={goNext}>
            Continue
          </button>
        ) : (
          <button
            type="submit"
            className="btn-primary"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Submitting…" : "Submit property"}
          </button>
        )}
      </div>

      {status === "error" ? (
        <p className="sell-form__error" role="alert">
          Something went wrong. Please try again.
        </p>
      ) : null}
    </form>
  );
}
