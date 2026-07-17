"use client";

import { FormEvent, useState } from "react";

export function ContactForm({ propertyId }: { propertyId?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
        propertyId: propertyId || null,
        source: "website",
      }),
    });
    setStatus(res.ok ? "ok" : "error");
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="field">
          <span>Name</span>
          <input name="name" required placeholder="Your name" />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" required placeholder="you@email.com" />
        </label>
      </div>
      <label className="field">
        <span>Phone</span>
        <input name="phone" placeholder="(555) 000-0000" />
      </label>
      <label className="field">
        <span>Message</span>
        <textarea name="message" required placeholder="How can we help?" />
      </label>
      <button className="btn-primary w-fit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Send message"}
      </button>
      {status === "ok" ? (
        <p className="text-sm text-green-700">
          Thank you! Your submission has been received.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-600">
          Oops! Something went wrong while submitting the form.
        </p>
      ) : null}
    </form>
  );
}
