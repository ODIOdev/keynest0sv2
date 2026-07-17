"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How long does it take to buy a home?",
    a: "The home-buying process typically takes 30 to 60 days from the time an offer is accepted, depending on factors like financing, inspections, and the closing process.",
  },
  {
    q: "How much should I save for a down payment?",
    a: "Many buyers aim for 10–20% of the purchase price, though programs and lender requirements can vary. We’ll help you map a realistic savings plan.",
  },
  {
    q: "Do I need a real estate agent to sell my home?",
    a: "An agent isn’t required, but experienced representation typically improves pricing strategy, marketing reach, and negotiation outcomes.",
  },
  {
    q: "What should I look for during a home inspection?",
    a: "Focus on structural integrity, roofing, plumbing, electrical systems, moisture issues, and any safety concerns that could affect long-term cost.",
  },
  {
    q: "What is the first step in buying a home?",
    a: "Start with a clear budget and pre-approval, then define your must-haves so we can shortlist properties that fit your goals.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-3">
      {faqs.map((item, index) => {
        const active = open === index;
        return (
          <div
            key={item.q}
            className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
              onClick={() => setOpen(active ? -1 : index)}
            >
              <span className="text-lg font-semibold tracking-tight text-[#0c0407]">
                {item.q}
              </span>
              <span className="text-2xl text-[#0c0407]">{active ? "−" : "+"}</span>
            </button>
            {active ? (
              <p className="border-t border-[#e8e8e8] px-5 py-4 text-[#758696]">
                {item.a}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
