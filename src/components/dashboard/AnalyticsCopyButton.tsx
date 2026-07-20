"use client";

import { useState } from "react";

export function AnalyticsCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className="ig-tool" onClick={() => void onCopy()}>
      <span className="ig-tool__icon" aria-hidden>
        ⎘
      </span>
      {copied ? "Copied snapshot" : "Copy snapshot"}
    </button>
  );
}
