"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { PropertyAnalytics } from "@/lib/property-analytics";

function healthLabel(health: PropertyAnalytics["listingHealth"]) {
  if (health === "strong") return "Strong demand";
  if (health === "steady") return "Steady interest";
  return "Needs a push";
}

function HealthRing({ score }: { score: number }) {
  const size = 88;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, score) / 100) * c;

  return (
    <div className="prop-analytics__ring" aria-hidden>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#7dd3fc"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="prop-analytics__ring-value">{score}</span>
    </div>
  );
}

export function PropertyAnalyticsButton({
  analytics,
  className = "dash-property-card__btn dash-property-card__btn--ghost",
}: {
  analytics: PropertyAnalytics;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const maxLead = Math.max(1, ...analytics.leadsByStatus.map((s) => s.value));
  const hasLeads = analytics.leadsTotal > 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        Analytics
      </button>

      {open
        ? createPortal(
            <div
              className="prop-analytics"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <button
                type="button"
                className="prop-analytics__backdrop"
                aria-label="Close analytics"
                onClick={() => setOpen(false)}
              />
              <div className="prop-analytics__panel" data-lenis-prevent>
                <header className="prop-analytics__hero">
                  <div className="prop-analytics__hero-copy">
                    <p className="prop-analytics__kicker">Listing analytics</p>
                    <h2 id={titleId} className="prop-analytics__title">
                      {analytics.title}
                    </h2>
                    <p className="prop-analytics__sub">
                      {analytics.addressLine || "Location TBD"}
                      <span aria-hidden> · </span>
                      <span className="prop-analytics__status">
                        {analytics.status}
                      </span>
                    </p>
                  </div>
                  <div className="prop-analytics__hero-score">
                    <HealthRing score={analytics.engagementScore} />
                    <div>
                      <p className="prop-analytics__health-label">
                        {healthLabel(analytics.listingHealth)}
                      </p>
                      <p className="prop-analytics__health-hint">
                        Engagement score
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="prop-analytics__close"
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M5 5l10 10M15 5L5 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </header>

                <div className="prop-analytics__body">
                  <div className="prop-analytics__stats">
                    <article className="prop-analytics__stat">
                      <p className="prop-analytics__stat-label">Views</p>
                      <p className="prop-analytics__stat-value">
                        {analytics.views.toLocaleString()}
                      </p>
                      <p className="prop-analytics__stat-hint">Page visits</p>
                    </article>
                    <article className="prop-analytics__stat">
                      <p className="prop-analytics__stat-label">Saves</p>
                      <p className="prop-analytics__stat-value">
                        {analytics.saves.toLocaleString()}
                      </p>
                      <p className="prop-analytics__stat-hint">Favorites</p>
                    </article>
                    <article className="prop-analytics__stat">
                      <p className="prop-analytics__stat-label">Inquiries</p>
                      <p className="prop-analytics__stat-value">
                        {analytics.inquiries.toLocaleString()}
                      </p>
                      <p className="prop-analytics__stat-hint">Buyer asks</p>
                    </article>
                    <article className="prop-analytics__stat">
                      <p className="prop-analytics__stat-label">Shares</p>
                      <p className="prop-analytics__stat-value">
                        {analytics.shareClicks.toLocaleString()}
                      </p>
                      <p className="prop-analytics__stat-hint">Outbound</p>
                    </article>
                  </div>

                  <div className="prop-analytics__grid">
                    <section className="prop-analytics__block">
                      <div className="prop-analytics__block-head">
                        <h3>Lead pipeline</h3>
                        <span>
                          {analytics.leadsTotal} total
                          {hasLeads
                            ? ` · ${analytics.leadsActive} active`
                            : ""}
                        </span>
                      </div>
                      {hasLeads ? (
                        <ul className="prop-analytics__bars">
                          {analytics.leadsByStatus.map((row) => (
                            <li key={row.key}>
                              <div className="prop-analytics__bar-top">
                                <span>{row.label}</span>
                                <span>{row.value}</span>
                              </div>
                              <div className="prop-analytics__bar-track">
                                <span
                                  className="prop-analytics__bar-fill"
                                  style={{
                                    width: `${Math.round(
                                      (row.value / maxLead) * 100,
                                    )}%`,
                                  }}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="prop-analytics__empty">
                          No CRM leads linked to this listing yet.
                        </p>
                      )}
                    </section>

                    <section className="prop-analytics__block prop-analytics__block--facts">
                      <div className="prop-analytics__block-head">
                        <h3>Listing pulse</h3>
                      </div>
                      <dl className="prop-analytics__facts">
                        <div>
                          <dt>Days on market</dt>
                          <dd>{analytics.daysOnMarket}</dd>
                        </div>
                        <div>
                          <dt>Media assets</dt>
                          <dd>{analytics.mediaCount}</dd>
                        </div>
                        <div>
                          <dt>Closed leads</dt>
                          <dd>{analytics.leadsClosed}</dd>
                        </div>
                        <div>
                          <dt>Conversion</dt>
                          <dd>
                            {analytics.leadsTotal === 0
                              ? "—"
                              : `${analytics.conversionRate}%`}
                          </dd>
                        </div>
                      </dl>
                    </section>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
