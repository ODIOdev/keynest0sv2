"use client";

import { FormEvent, useState } from "react";
import {
  formatMoneyDigits,
  formatPhoneInput,
  parseMoneyDigits,
} from "@/lib/format";
import { PlacesAutocompleteInput } from "@/components/site/PlacesAutocompleteInput";

const GOALS = [
  { value: "buy", label: "Buy", hint: "Find a home to purchase" },
  { value: "rent", label: "Rent", hint: "Lease a place to live" },
  { value: "sell", label: "Sell", hint: "List a property" },
] as const;

const PROPERTY_TYPES = [
  "House",
  "Condo",
  "Townhouse",
  "Multi-family",
  "Land",
  "Commercial",
] as const;

const CONTACT_METHODS = [
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
] as const;

const MORTGAGE_MONTHS = Array.from({ length: 400 }, (_, i) => i + 1);

export function AgentTalkForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [goal, setGoal] = useState<(typeof GOALS)[number]["value"] | "">("");
  const [contactMethod, setContactMethod] = useState("email");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [secondaryLocation, setSecondaryLocation] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [propertyPaidOff, setPropertyPaidOff] = useState<"yes" | "no" | "">(
    "",
  );
  const [mortgageMonths, setMortgageMonths] = useState("");
  const isRent = goal === "rent";
  const isSell = goal === "sell";
  const mortgageActive = isSell && propertyPaidOff === "no";

  function resetMoneyFields() {
    setBudgetMin("");
    setBudgetMax("");
    setAnnualIncome("");
  }

  function setPaidOff(next: "yes" | "no") {
    setPropertyPaidOff((prev) => {
      const value = prev === next ? "" : next;
      if (value !== "no") setMortgageMonths("");
      return value;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!goal) return;
    setStatus("loading");
    const form = new FormData(e.currentTarget);

    const types = form.getAll("propertyType").map(String);
    const message = [
      `Goal: ${goal}`,
      `Timeline: ${form.get("timeline") || "not specified"}`,
      `Preferred contact: ${contactMethod}`,
      `Best time: ${form.get("bestTime") || "flexible"}`,
      `Primary location: ${location || "—"}`,
      secondaryLocation ? `Also considering: ${secondaryLocation}` : null,
      types.length ? `Property types: ${types.join(", ")}` : null,
      form.get("beds") ? `Beds (min): ${form.get("beds")}` : null,
      form.get("baths") ? `Baths (min): ${form.get("baths")}` : null,
      budgetMin || budgetMax
        ? `${isRent ? "Rent" : "Budget"}: ${budgetMin ? `$${formatMoneyDigits(budgetMin)}` : "any"} – ${budgetMax ? `$${formatMoneyDigits(budgetMax)}` : "any"}`
        : null,
      isRent
        ? annualIncome
          ? `Annual income: $${formatMoneyDigits(annualIncome)}`
          : null
        : isSell
          ? mortgageActive && mortgageMonths
            ? `Mortgage remaining: ${mortgageMonths} months`
            : null
          : form.get("financing")
            ? `Financing: ${form.get("financing")}`
            : null,
      isRent
        ? form.get("creditScore")
          ? `Credit score: ${form.get("creditScore")}`
          : null
        : isSell
          ? propertyPaidOff
            ? `Property paid off: ${propertyPaidOff}`
            : null
          : form.get("preapproved")
            ? `Pre-approved: ${form.get("preapproved")}`
            : null,
      form.get("movers") ? `Household size: ${form.get("movers")}` : null,
      form.get("message") ? `Notes:\n${form.get("message")}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone,
        message,
        propertyId: null,
        source: "talk-to-agent",
      }),
    });

    setStatus(res.ok ? "ok" : "error");
    if (res.ok) {
      e.currentTarget.reset();
      setGoal("");
      setContactMethod("email");
      setPhone("");
      setLocation("");
      setSecondaryLocation("");
      setPropertyPaidOff("");
      setMortgageMonths("");
      resetMoneyFields();
    }
  }

  return (
    <form onSubmit={onSubmit} className="agent-form">
      <section className="agent-form__section">
        <header className="agent-form__section-head">
          <p className="agent-form__step">01</p>
          <div>
            <h3 className="agent-form__section-title">Your goal</h3>
            <p className="agent-form__section-sub">
              What should your agent help with first?
            </p>
          </div>
        </header>
        <div className="agent-form__goals" role="radiogroup" aria-label="Goal">
          {GOALS.map((item) => (
            <label
              key={item.value}
              className={`agent-form__goal${goal === item.value ? " is-active" : ""}`}
            >
              <input
                type="radio"
                name="interest"
                value={item.value}
                checked={goal === item.value}
                onChange={() => {
                  setGoal(item.value);
                  setPropertyPaidOff("");
                  setMortgageMonths("");
                  resetMoneyFields();
                }}
                required
              />
              <span className="agent-form__goal-label">{item.label}</span>
              <span className="agent-form__goal-hint">{item.hint}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="agent-form__section">
        <header className="agent-form__section-head">
          <p className="agent-form__step">02</p>
          <div>
            <h3 className="agent-form__section-title">Contact details</h3>
            <p className="agent-form__section-sub">
              How should we reach you?
            </p>
          </div>
        </header>
        <div className="agent-form__grid">
          <label className="field">
            <span>Full name</span>
            <input name="name" required placeholder="Alex Morgan" autoComplete="name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="you@email.com"
              autoComplete="email"
            />
          </label>
          <div className="agent-form__pair">
            <label className="field">
              <span>Phone</span>
              <input
                name="phone"
                type="tel"
                required
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                pattern="\(\d{3}\) \d{3}-\d{4}"
                title="Enter a 10-digit phone number"
                maxLength={14}
              />
            </label>
            <label className="field">
              <span>Best time to connect</span>
              <select name="bestTime" defaultValue="flexible">
                <option value="flexible">Flexible</option>
                <option value="mornings">Mornings</option>
                <option value="afternoons">Afternoons</option>
                <option value="evenings">Evenings</option>
                <option value="weekends">Weekends</option>
              </select>
            </label>
          </div>
        </div>
        <div className="agent-form__pills" role="radiogroup" aria-label="Preferred contact">
          {CONTACT_METHODS.map((m) => (
            <label
              key={m.value}
              className={`agent-form__pill${contactMethod === m.value ? " is-active" : ""}`}
            >
              <input
                type="radio"
                name="contactMethod"
                value={m.value}
                checked={contactMethod === m.value}
                onChange={() => setContactMethod(m.value)}
              />
              {m.label}
            </label>
          ))}
        </div>
      </section>

      <section className="agent-form__section">
        <header className="agent-form__section-head">
          <p className="agent-form__step">03</p>
          <div>
            <h3 className="agent-form__section-title">Location & timing</h3>
            <p className="agent-form__section-sub">
              Where and when are you looking to move?
            </p>
          </div>
        </header>
        <div className="agent-form__grid">
          <label className="field agent-form__span-2">
            <span>Primary city or neighborhood</span>
            <PlacesAutocompleteInput
              name="location"
              required
              autoComplete="off"
              placeholder="Start typing an address or area…"
              value={location}
              onChange={setLocation}
            />
          </label>
          <label className="field agent-form__span-2">
            <span>Other areas to consider</span>
            <PlacesAutocompleteInput
              name="secondaryLocation"
              autoComplete="off"
              placeholder="Optional — suburbs, nearby cities…"
              value={secondaryLocation}
              onChange={setSecondaryLocation}
            />
          </label>
          <div className="agent-form__pair">
            <label className="field">
              <span>Timeline</span>
              <select name="timeline" required defaultValue="">
                <option value="" disabled>
                  Select timeline
                </option>
                <option value="asap">As soon as possible</option>
                <option value="1-3-months">1–3 months</option>
                <option value="3-6-months">3–6 months</option>
                <option value="6-plus">6+ months</option>
                <option value="exploring">Just exploring</option>
              </select>
            </label>
            <label className="field">
              <span>Household / movers</span>
              <select name="movers" defaultValue="">
                <option value="">Optional</option>
                <option value="just-me">Just me</option>
                <option value="couple">Couple</option>
                <option value="family-small">Family (1–2 kids)</option>
                <option value="family-large">Family (3+ kids)</option>
                <option value="roommates">Roommates</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="agent-form__section">
        <header className="agent-form__section-head">
          <p className="agent-form__step">04</p>
          <div>
            <h3 className="agent-form__section-title">Property preferences</h3>
            <p className="agent-form__section-sub">
              Help us shortlist the right matches.
            </p>
          </div>
        </header>
        <fieldset className="agent-form__types">
          <legend className="agent-form__legend">Property types</legend>
          <div className="agent-form__checks">
            {PROPERTY_TYPES.map((type) => (
              <label key={type} className="agent-form__check">
                <input type="checkbox" name="propertyType" value={type} />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="agent-form__grid">
          <div className="agent-form__pair">
            <label className="field">
              <span>Min. bedrooms</span>
              <select name="beds" defaultValue="">
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </label>
            <label className="field">
              <span>Min. bathrooms</span>
              <select name="baths" defaultValue="">
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="1.5">1.5+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </label>
          </div>
          <div className="agent-form__pair">
            <label className="field">
              <span>{isRent ? "Rent min" : "Budget min (USD)"}</span>
              <div className="field-money">
                <span className="field-money__prefix" aria-hidden>
                  $
                </span>
                <input type="hidden" name="budgetMin" value={budgetMin} />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={isRent ? "1,500" : "250,000"}
                  value={formatMoneyDigits(budgetMin)}
                  onChange={(e) =>
                    setBudgetMin(parseMoneyDigits(e.target.value))
                  }
                  aria-label={isRent ? "Rent min in dollars" : "Budget min in dollars"}
                />
              </div>
            </label>
            <label className="field">
              <span>{isRent ? "Rent max" : "Budget max (USD)"}</span>
              <div className="field-money">
                <span className="field-money__prefix" aria-hidden>
                  $
                </span>
                <input type="hidden" name="budgetMax" value={budgetMax} />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={isRent ? "3,500" : "650,000"}
                  value={formatMoneyDigits(budgetMax)}
                  onChange={(e) =>
                    setBudgetMax(parseMoneyDigits(e.target.value))
                  }
                  aria-label={isRent ? "Rent max in dollars" : "Budget max in dollars"}
                />
              </div>
            </label>
          </div>
          {isSell ? (
            <div className="agent-form__sell-row">
              <fieldset className="field">
                <span>Property paid off?</span>
                <div
                  className="agent-form__checks"
                  role="group"
                  aria-label="Property paid off"
                >
                  <label className="agent-form__check">
                    <input
                      type="checkbox"
                      name="propertyPaidOff"
                      value="yes"
                      checked={propertyPaidOff === "yes"}
                      onChange={() => setPaidOff("yes")}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="agent-form__check">
                    <input
                      type="checkbox"
                      name="propertyPaidOff"
                      value="no"
                      checked={propertyPaidOff === "no"}
                      onChange={() => setPaidOff("no")}
                    />
                    <span>No</span>
                  </label>
                </div>
              </fieldset>
              <label
                className={`field${mortgageActive ? " is-mortgage-active" : " is-mortgage-idle"}`}
              >
                <span>Mortgage</span>
                <select
                  name="mortgageMonths"
                  value={mortgageMonths}
                  disabled={!mortgageActive}
                  onChange={(e) => setMortgageMonths(e.target.value)}
                  aria-disabled={!mortgageActive}
                >
                  <option value="">
                    {mortgageActive
                      ? "Select months remaining"
                      : "Select No if mortgage remains"}
                  </option>
                  {MORTGAGE_MONTHS.map((months) => (
                    <option key={months} value={months}>
                      {months} {months === 1 ? "month" : "months"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="agent-form__pair">
              {isRent ? (
                <>
                  <label className="field">
                    <span>Annual income</span>
                    <div className="field-money">
                      <span className="field-money__prefix" aria-hidden>
                        $
                      </span>
                      <input
                        type="hidden"
                        name="annualIncome"
                        value={annualIncome}
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="85,000"
                        value={formatMoneyDigits(annualIncome)}
                        onChange={(e) =>
                          setAnnualIncome(parseMoneyDigits(e.target.value))
                        }
                        aria-label="Annual income in dollars"
                      />
                    </div>
                  </label>
                  <label className="field">
                    <span>Credit score</span>
                    <select name="creditScore" defaultValue="">
                      <option value="">Prefer not to say</option>
                      <option value="poor">Poor</option>
                      <option value="good">Good</option>
                      <option value="excellent">Excellent</option>
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label className="field">
                    <span>Financing</span>
                    <select name="financing" defaultValue="">
                      <option value="">Not sure yet</option>
                      <option value="cash">Cash</option>
                      <option value="mortgage">Mortgage</option>
                      <option value="lease">Lease / rental</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>Pre-approved?</span>
                    <select name="preapproved" defaultValue="">
                      <option value="">Prefer not to say</option>
                      <option value="yes">Yes</option>
                      <option value="in-progress">In progress</option>
                      <option value="no">Not yet</option>
                      <option value="n-a">Not applicable</option>
                    </select>
                  </label>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="agent-form__section">
        <header className="agent-form__section-head">
          <p className="agent-form__step">05</p>
          <div>
            <h3 className="agent-form__section-title">Anything else?</h3>
            <p className="agent-form__section-sub">
              Must-haves, deal-breakers, or questions for your agent.
            </p>
          </div>
        </header>
        <label className="field">
          <span>Notes for your agent</span>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="School district, parking, pets, commute, renovations, investment criteria…"
          />
        </label>
      </section>

      <div className="agent-form__footer">
        <p className="agent-form__legal">
          By submitting, you agree we may contact you about this request. No
          spam — just a real follow-up from our team.
        </p>
        <button className="btn-primary" disabled={status === "loading" || !goal}>
          {status === "loading" ? "Sending request…" : "Request an agent"}
        </button>
        {status === "ok" ? (
          <p className="agent-form__ok">
            Thanks — an agent will reach out shortly with next steps.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="agent-form__err">
            Something went wrong. Please try again.
          </p>
        ) : null}
      </div>
    </form>
  );
}
