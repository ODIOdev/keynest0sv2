"use client";

import { FormEvent, useState } from "react";
import { formatPhoneInput } from "@/lib/format";

export function PropertyInquiryForm({
  propertyId,
  listingLabel,
}: {
  propertyId: string;
  listingLabel: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [phone, setPhone] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const note = String(form.get("message") || "").trim();
    const message = [`Inquiry about ${listingLabel}`, note]
      .filter(Boolean)
      .join("\n\n");

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone,
        message,
        propertyId,
        source: "property",
      }),
    });

    setStatus(res.ok ? "ok" : "error");
    if (res.ok) {
      e.currentTarget.reset();
      setPhone("");
    }
  }

  return (
    <form className="pdp-inquiry" onSubmit={onSubmit}>
      <label className="pdp-inquiry__field">
        <span>Name</span>
        <input name="name" required autoComplete="name" placeholder="Your name" />
      </label>
      <label className="pdp-inquiry__field">
        <span>Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
        />
      </label>
      <label className="pdp-inquiry__field">
        <span>Phone</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(555) 000-0000"
          value={phone}
          onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
        />
      </label>
      <label className="pdp-inquiry__field">
        <span>Message</span>
        <textarea
          name="message"
          rows={3}
          required
          defaultValue={`I am interested in ${listingLabel}.`}
        />
      </label>
      <button
        type="submit"
        className="pdp-inquiry__submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending…" : "Contact agent"}
      </button>
      {status === "ok" ? (
        <p className="pdp-inquiry__ok" role="status">
          Thanks — an agent will follow up shortly.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="pdp-inquiry__err" role="alert">
          Something went wrong. Please try again.
        </p>
      ) : null}
    </form>
  );
}
