import Link from "next/link";
import { AnalyticsCopyButton } from "@/components/dashboard/AnalyticsCopyButton";
import { formatPrice } from "@/lib/format";
import type { Lead, Property } from "@/lib/types";
import type { SiteAnalytics } from "@/lib/site-analytics";

function AreaSpark({
  values,
  color,
  id,
}: {
  values: number[];
  color: string;
  id: string;
}) {
  const w = 320;
  const h = 88;
  const pad = 4;
  const max = Math.max(...values, 1);
  const coords = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return { x, y };
  });
  const line = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M${pad},${h - pad} L${coords.map((p) => `${p.x},${p.y}`).join(" L")} L${w - pad},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="ig-spark" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={line}
      />
    </svg>
  );
}

function PulseRing({ score }: { score: number }) {
  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, score) / 100) * c;

  return (
    <div className="ig-pulse">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#5eead4"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ig-pulse__center">
        <p className="ig-pulse__score">{score}</p>
        <p className="ig-pulse__label">Pulse</p>
      </div>
    </div>
  );
}

export function OverviewBoard({
  data,
  recentLeads,
  recentProperties,
}: {
  data: SiteAnalytics;
  recentLeads: Lead[];
  recentProperties: Property[];
}) {
  const pulse = Math.min(
    100,
    Math.round(
      data.pipelineRate * 0.4 +
        data.publishRate * 0.35 +
        data.closeRate * 0.25,
    ),
  );

  const pipeline = data.leadsByStatus.filter((s) => s.key !== "lost");
  const pipelineMax = Math.max(1, ...pipeline.map((s) => s.value));
  const statusTotal = Math.max(
    1,
    data.leadsByStatus.reduce((s, i) => s + i.value, 0),
  );

  const snapshot = [
    `KeyNestOS overview · ${data.generatedAt}`,
    `Ops pulse ${pulse}/100`,
    `Properties ${data.properties} (${data.published} live) · Leads ${data.leads} (${data.newLeads} new)`,
    `Pipeline ${data.pipelineRate}% · Publish ${data.publishRate}% · Close ${data.closeRate}%`,
    ...data.insights.slice(0, 3).map((i) => `• ${i}`),
  ].join("\n");

  return (
    <div className="ig">
      <section className="ig-hero">
        <div className="ig-hero__glow" aria-hidden />
        <div className="ig-hero__main">
          <PulseRing score={pulse} />
          <div className="ig-hero__copy">
            <p className="ig-hero__kicker">CRM overview</p>
            <h2 className="ig-hero__title">Brokerage command center</h2>
            <p className="ig-hero__sub">
              Inventory, lead flow, and what needs action next — same pulse view
              as analytics, tuned for daily ops.
            </p>
            <div className="ig-hero__chips">
              <span className="ig-chip ig-chip--teal">
                {data.pipelineActive} active pipeline
              </span>
              <span className="ig-chip ig-chip--amber">
                {data.draftCount} drafts
              </span>
              <span className="ig-chip ig-chip--sky">
                {data.agents} agents on roster
              </span>
            </div>
          </div>
        </div>
        <div className="ig-kpi-row">
          <article className="ig-kpi ig-kpi--navy">
            <div className="ig-kpi__top">
              <span className="ig-kpi__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10.5 12 3l9 7.5" />
                  <path d="M5 9.5V21h14V9.5" />
                </svg>
              </span>
              <p className="ig-kpi__label">Properties</p>
            </div>
            <p className="ig-kpi__value">{data.properties}</p>
            <p className="ig-kpi__hint">{data.published} published</p>
          </article>
          <article className="ig-kpi ig-kpi--coral">
            <div className="ig-kpi__top">
              <span className="ig-kpi__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <p className="ig-kpi__label">New leads</p>
            </div>
            <p className="ig-kpi__value">{data.newLeads}</p>
            <p className="ig-kpi__hint">{data.leads} total in CRM</p>
          </article>
          <article className="ig-kpi ig-kpi--amber">
            <div className="ig-kpi__top">
              <span className="ig-kpi__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.5-3.5a2 2 0 0 0-2.8 0L6 20" />
                </svg>
              </span>
              <p className="ig-kpi__label">Media</p>
            </div>
            <p className="ig-kpi__value">{data.media}</p>
            <p className="ig-kpi__hint">{data.categories} categories</p>
          </article>
          <article className="ig-kpi ig-kpi--teal">
            <div className="ig-kpi__top">
              <span className="ig-kpi__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </span>
              <p className="ig-kpi__label">Close rate</p>
            </div>
            <p className="ig-kpi__value">{data.closeRate}%</p>
            <p className="ig-kpi__hint">Won from all leads</p>
          </article>
        </div>
      </section>

      <section className="ig-tools" aria-label="Quick tools">
        <Link href="/dashboard/analytics" className="ig-tool ig-tool--teal">
          <span className="ig-tool__icon" aria-hidden>
            ◆
          </span>
          Full analytics
        </Link>
        <Link href="/dashboard/leads" className="ig-tool ig-tool--coral">
          <span className="ig-tool__icon" aria-hidden>
            ●
          </span>
          {data.newLeads} new leads
        </Link>
        <Link href="/dashboard/properties/new" className="ig-tool ig-tool--sky">
          <span className="ig-tool__icon" aria-hidden>
            ＋
          </span>
          Add property
        </Link>
        <Link href="/dashboard/properties" className="ig-tool ig-tool--amber">
          <span className="ig-tool__icon" aria-hidden>
            ▲
          </span>
          {data.attentionList.length} need attention
        </Link>
        <AnalyticsCopyButton text={snapshot} />
      </section>

      <section className="ig-panel ig-funnel-wrap">
        <div className="ig-panel__head">
          <div>
            <h3 className="ig-panel__title">Ops conversion</h3>
            <p className="ig-panel__sub">
              Pipeline progress, publish coverage, and close rate
            </p>
          </div>
        </div>
        <ol className="ig-funnel">
          <li className="ig-funnel__step ig-funnel__step--sky">
            <div className="ig-funnel__top">
              <span className="ig-funnel__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
              <p className="ig-funnel__label">Pipeline</p>
            </div>
            <p className="ig-funnel__value">{data.pipelineRate}%</p>
            <p className="ig-funnel__rate">{data.pipelineActive} active</p>
          </li>
          <li className="ig-funnel__step ig-funnel__step--teal">
            <div className="ig-funnel__top">
              <span className="ig-funnel__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
              </span>
              <p className="ig-funnel__label">Published</p>
            </div>
            <p className="ig-funnel__value">{data.publishRate}%</p>
            <p className="ig-funnel__rate">
              {data.published}/{data.properties} live
            </p>
          </li>
          <li className="ig-funnel__step ig-funnel__step--amber">
            <div className="ig-funnel__top">
              <span className="ig-funnel__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
                </svg>
              </span>
              <p className="ig-funnel__label">Featured</p>
            </div>
            <p className="ig-funnel__value">{data.featuredCount}</p>
            <p className="ig-funnel__rate">Homepage spotlight</p>
          </li>
          <li className="ig-funnel__step ig-funnel__step--coral">
            <div className="ig-funnel__top">
              <span className="ig-funnel__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </span>
              <p className="ig-funnel__label">Close rate</p>
            </div>
            <p className="ig-funnel__value">{data.closeRate}%</p>
            <p className="ig-funnel__rate">Won deals</p>
          </li>
        </ol>
      </section>

      <div className="ig-grid ig-grid--2">
        <section className="ig-panel">
          <div className="ig-panel__head">
            <div>
              <h3 className="ig-panel__title">Leads · 7 days</h3>
              <p className="ig-panel__sub">Daily inquiry intake</p>
            </div>
            <span
              className={`ig-delta ${data.leadsWow >= 0 ? "is-up" : "is-down"}`}
            >
              {data.leadsWow >= 0 ? "▲" : "▼"} {Math.abs(data.leadsWow)}% WoW
            </span>
          </div>
          <AreaSpark
            id="ov-leads"
            values={data.leadsTrend.map((d) => d.value)}
            color="#e11d48"
          />
          <div className="ig-axis">
            <span>{data.leadsTrend[0]?.label}</span>
            <span>{data.leadsTrend[data.leadsTrend.length - 1]?.label}</span>
          </div>
        </section>

        <section className="ig-panel">
          <div className="ig-panel__head">
            <div>
              <h3 className="ig-panel__title">Lead status mix</h3>
              <p className="ig-panel__sub">Where the CRM stands today</p>
            </div>
          </div>
          <div className="ig-stack" role="img" aria-label="Lead status mix">
            {data.leadsByStatus.map((item, i) => {
              const tones = ["sky", "teal", "amber", "lime", "coral"] as const;
              const tone = tones[i % tones.length];
              return (
                <div
                  key={item.key}
                  className={`ig-stack__seg ig-stack__seg--${tone === "lime" ? "teal" : tone}`}
                  style={{
                    flexGrow: item.value || 0.0001,
                    background:
                      item.key === "new"
                        ? "#0284c7"
                        : item.key === "contacted"
                          ? "#0d9488"
                          : item.key === "qualified"
                            ? "#d97706"
                            : item.key === "closed"
                              ? "#65a30d"
                              : "#e11d48",
                  }}
                  title={`${item.label}: ${item.value}`}
                >
                  {item.value > 0 ? (
                    <span>
                      {item.label} · {item.value}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
          <ul className="ig-legend">
            {data.leadsByStatus.map((item) => (
              <li key={item.key}>
                <span
                  className="ig-legend__dot"
                  style={{
                    background:
                      item.key === "new"
                        ? "#0284c7"
                        : item.key === "contacted"
                          ? "#0d9488"
                          : item.key === "qualified"
                            ? "#d97706"
                            : item.key === "closed"
                              ? "#65a30d"
                              : "#e11d48",
                  }}
                />
                <span>{item.label}</span>
                <strong>
                  {item.value} ·{" "}
                  {Math.round((item.value / statusTotal) * 100)}%
                </strong>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="ig-grid ig-grid--health">
        <section className="ig-panel">
          <div className="ig-panel__head">
            <div>
              <h3 className="ig-panel__title">Lead pipeline</h3>
              <p className="ig-panel__sub">Active stages only</p>
            </div>
          </div>
          <ul className="ig-river">
            {pipeline.map((stage, i) => (
              <li key={stage.key} className="ig-river__item">
                <div className="ig-river__meta">
                  <span className="ig-river__label">{stage.label}</span>
                  <span className="ig-river__value">{stage.value}</span>
                </div>
                <div className="ig-river__track">
                  <div
                    className="ig-river__fill"
                    style={{
                      width: `${(stage.value / pipelineMax) * 100}%`,
                      background: ["#0284c7", "#0d9488", "#d97706", "#65a30d"][
                        i % 4
                      ],
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="ig-panel">
          <div className="ig-panel__head">
            <div>
              <h3 className="ig-panel__title">Inventory mix</h3>
              <p className="ig-panel__sub">Type and status at a glance</p>
            </div>
          </div>
          <ol className="ig-funnel ig-funnel--mix">
            {data.listingTypes.map((item) => (
              <li
                key={item.key}
                className={`ig-funnel__step ig-funnel__step--${item.key === "rent" ? "sky" : "navy"}`}
              >
                <div className="ig-funnel__top">
                  <span className="ig-funnel__icon" aria-hidden>
                    {item.key === "rent" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 10.5 12 3l9 7.5" />
                        <path d="M5 9.5V21h14V9.5" />
                        <path d="M9 21v-6h6v6" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    )}
                  </span>
                  <p className="ig-funnel__label">{item.label}</p>
                </div>
                <p className="ig-funnel__value">{item.value}</p>
                <p className="ig-funnel__rate">Listing type</p>
              </li>
            ))}
            {data.propertyStatuses.map((item) => {
              const tone =
                item.key === "published"
                  ? "teal"
                  : item.key === "draft"
                    ? "amber"
                    : item.key === "sold"
                      ? "coral"
                      : "sky";
              return (
                <li
                  key={item.key}
                  className={`ig-funnel__step ig-funnel__step--${tone}`}
                >
                  <div className="ig-funnel__top">
                    <span className="ig-funnel__icon" aria-hidden>
                      {item.key === "published" ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <path d="m9 11 3 3L22 4" />
                        </svg>
                      ) : item.key === "draft" ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      ) : item.key === "sold" ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v20" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 10.5 12 3l9 7.5" />
                          <path d="M5 9.5V21h14V9.5" />
                        </svg>
                      )}
                    </span>
                    <p className="ig-funnel__label">{item.label}</p>
                  </div>
                  <p className="ig-funnel__value">{item.value}</p>
                  <p className="ig-funnel__rate">Status</p>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <div className="ig-grid ig-grid--2">
        <section className="ig-panel ig-panel--tool">
          <div className="ig-panel__head">
            <div>
              <h3 className="ig-panel__title">Recent leads</h3>
              <p className="ig-panel__sub">Newest inquiries in the CRM</p>
            </div>
            <Link href="/dashboard/leads" className="ig-link">
              View all
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="ig-empty">No leads yet.</p>
          ) : (
            <ul className="ig-queue">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="ig-queue__item">
                  <div className="ig-queue__score" aria-hidden>
                    {lead.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="ig-queue__body">
                    <p className="ig-queue__title">{lead.name}</p>
                    <p className="ig-queue__meta">
                      {lead.status} · {lead.message.slice(0, 72)}
                      {lead.message.length > 72 ? "…" : ""}
                    </p>
                  </div>
                  <Link href="/dashboard/leads" className="ig-queue__action">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ig-panel">
          <div className="ig-panel__head">
            <div>
              <h3 className="ig-panel__title">Latest listings</h3>
              <p className="ig-panel__sub">Most recent inventory</p>
            </div>
            <Link href="/dashboard/properties" className="ig-link">
              Manage
            </Link>
          </div>
          {recentProperties.length === 0 ? (
            <p className="ig-empty">No properties yet.</p>
          ) : (
            <ol className="ig-rank">
              {recentProperties.map((property, index) => {
                const price = formatPrice(property);
                return (
                  <li key={property.id} className="ig-rank__item">
                    <span className={`ig-rank__n ig-rank__n--${Math.min(index + 1, 3)}`}>
                      {index + 1}
                    </span>
                    <div className="ig-rank__body">
                      <div className="ig-rank__row">
                        <p className="ig-rank__title">{property.title}</p>
                        <span className="ig-rank__price">
                          {price.amount}
                          {price.suffix}
                        </span>
                      </div>
                      <p className="ig-rank__meta">
                        {property.status} ·{" "}
                        {property.listingType === "rent" ? "For rent" : "For sale"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>

      <section className="ig-insights">
        <h3 className="ig-insights__title">Today&apos;s focus</h3>
        <ul>
          {data.insights.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
