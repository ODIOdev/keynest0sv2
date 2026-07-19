"use client";

import { FormEvent, useState } from "react";

const TOPICS = [
  { value: "general", label: "General question" },
  { value: "buying", label: "Buying" },
  { value: "renting", label: "Renting" },
  { value: "selling", label: "Selling" },
  { value: "support", label: "Account / support" },
  { value: "press", label: "Press / partnership" },
] as const;

export function ContactForm({ propertyId }: { propertyId?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [topic, setTopic] = useState<(typeof TOPICS)[number]["value"]>("general");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const note = String(form.get("message") || "").trim();
    const message = [
      `Topic: ${topic}`,
      form.get("company") ? `Company: ${form.get("company")}` : null,
      form.get("preferredContact")
        ? `Prefer: ${form.get("preferredContact")}`
        : null,
      note,
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
        propertyId: propertyId || null,
        source: propertyId ? "property" : "contact",
      }),
    });
    setStatus(res.ok ? "ok" : "error");
    if (res.ok) {
      e.currentTarget.reset();
      setTopic("general");
    }
  }

  return (
    <form onSubmit={onSubmit} className="contact-form">
      <div className="contact-form__topics" role="radiogroup" aria-label="Topic">
        {TOPICS.map((item) => (
          <label
            key={item.value}
            className={`contact-form__topic${topic === item.value ? " is-active" : ""}`}
          >
            <input
              type="radio"
              name="topic"
              value={item.value}
              checked={topic === item.value}
              onChange={() => setTopic(item.value)}
            />
            {item.label}
          </label>
        ))}
      </div>

      <div className="contact-form__grid">
        <label className="field">
          <span>Full name</span>
          <input
            name="name"
            required
            placeholder="Alex Morgan"
            autoComplete="name"
          />
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
        <label className="field">
          <span>Phone</span>
          <input
            name="phone"
            type="tel"
            placeholder="(555) 000-0000"
            autoComplete="tel"
          />
        </label>
        <label className="field">
          <span>Company (optional)</span>
          <input name="company" placeholder="Brokerage or business" />
        </label>
        <label className="field contact-form__span-2">
          <span>Preferred reply</span>
          <select name="preferredContact" defaultValue="email">
            <option value="email">Email</option>
            <option value="phone">Phone call</option>
            <option value="either">Either works</option>
          </select>
        </label>
        <label className="field contact-form__span-2">
          <span>How can we help?</span>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Share a bit of context — listings you’re eyeing, timeline, or questions for the team."
          />
        </label>
      </div>

      <div className="contact-form__footer">
        <p className="contact-form__legal">
          We typically reply within one business day. Your details stay with
          KeyNestOS — no third-party spam.
        </p>
        <button className="btn-primary" disabled={status === "loading"}>
          {status === "loading" ? "Sending…" : "Send message"}
        </button>
        {status === "ok" ? (
          <p className="contact-form__ok">
            Thank you — your message is in. We’ll be in touch shortly.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="contact-form__err">
            Something went wrong. Please try again.
          </p>
        ) : null}
      </div>
    </form>
  );
}
