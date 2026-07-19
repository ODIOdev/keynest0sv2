"use client";

import { FormEvent, useState } from "react";
import { formatPhoneInput } from "@/lib/format";
import { PlacesAutocompleteInput } from "@/components/site/PlacesAutocompleteInput";

const GOALS = [
  { value: "buy", label: "Buy", hint: "Find a home to purchase" },
  { value: "rent", label: "Rent", hint: "Lease a place to live" },
  { value: "sell", label: "Sell", hint: "List a property" },
  { value: "invest", label: "Invest", hint: "Build a portfolio" },
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

export function AgentTalkForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [goal, setGoal] = useState<(typeof GOALS)[number]["value"] | "">("");
  const [contactMethod, setContactMethod] = useState("email");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [secondaryLocation, setSecondaryLocation] = useState("");

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
      form.get("budgetMin") || form.get("budgetMax")
        ? `Budget: ${form.get("budgetMin") || "any"} – ${form.get("budgetMax") || "any"}`
        : null,
      form.get("financing") ? `Financing: ${form.get("financing")}` : null,
      form.get("preapproved") ? `Pre-approved: ${form.get("preapproved")}` : null,
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
                onChange={() => setGoal(item.value)}
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
              <span>Budget min (USD)</span>
              <input
                name="budgetMin"
                type="number"
                min={0}
                step={1000}
                placeholder="250000"
              />
            </label>
            <label className="field">
              <span>Budget max (USD)</span>
              <input
                name="budgetMax"
                type="number"
                min={0}
                step={1000}
                placeholder="650000"
              />
            </label>
          </div>
          <div className="agent-form__pair">
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
          </div>
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
