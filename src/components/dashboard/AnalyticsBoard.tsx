import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteAnalytics } from "@/lib/site-analytics";
import { AnalyticsCopyButton } from "@/components/dashboard/AnalyticsCopyButton";

const TONE_HEX: Record<string, string> = {
  navy: "#1e3a5f",
  teal: "#0d9488",
  amber: "#d97706",
  coral: "#e11d48",
  sky: "#0284c7",
  lime: "#65a30d",
};

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

export function AnalyticsBoard({ data }: { data: SiteAnalytics }) {
  const healthTotal = Math.max(
    1,
    data.healthMix.reduce((s, i) => s + i.value, 0),
  );
  const maxViews = Math.max(1, ...data.topListings.map((l) => l.views));
  const maxAgent = Math.max(1, ...data.byAgent.map((a) => a.value), 1);
  const maxSource = Math.max(1, ...data.leadsBySource.map((s) => s.value), 1);
  const pipeline = data.leadsByStatus.filter((s) => s.key !== "lost");
  const pipelineMax = Math.max(1, ...pipeline.map((s) => s.value));

  const snapshot = [
    `KeyNestOS analytics · ${data.generatedAt}`,
    `Pulse ${data.pulseScore}/100`,
    `Views ${data.webViews} · Saves ${data.webSaves} · Inquiries ${data.webInquiries} · Closed ${data.funnel[3].value}`,
    `Leads ${data.leads} (${data.leadsWow >= 0 ? "+" : ""}${data.leadsWow}% WoW) · Published ${data.published}/${data.properties}`,
    `Attention queue: ${data.attentionList.length}`,
    ...data.insights.map((i) => `• ${i}`),
  ].join("\n");

  return (
    <div className="ig">
      <section className="ig-hero">
        <div className="ig-hero__glow" aria-hidden />
        <div className="ig-hero__main">
          <PulseRing score={data.pulseScore} />
          <div className="ig-hero__copy">
            <p className="ig-hero__kicker">Market pulse</p>
            <h2 className="ig-hero__title">Listing &amp; pipeline command center</h2>
            <p className="ig-hero__sub">
              One scroll of engagement, conversion, and action queues — refreshed{" "}
              {data.generatedAt}.
            </p>
            <div className="ig-hero__chips">
              <span className="ig-chip ig-chip--teal">
                Avg engagement {data.avgEngagement}
              </span>
              <span className="ig-chip ig-chip--amber">
                {data.avgDaysOnMarket}d on market
              </span>
              <span className="ig-chip ig-chip--sky">
                {data.linkedLeadRate}% listings with leads
              </span>
            </div>
          </div>
        </div>
        <div className="ig-kpi-row">
          <article className="ig-kpi ig-kpi--navy">
            <div className="ig-kpi__top">
              <span className="ig-kpi__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <p className="ig-kpi__label">Views</p>
            </div>
            <p className="ig-kpi__value">{data.webViews.toLocaleString()}</p>
            <p className="ig-kpi__hint">Public listing traffic</p>
          </article>
          <article className="ig-kpi ig-kpi--teal">
            <div className="ig-kpi__top">
              <span className="ig-kpi__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.5-1.5 2-3 2-4.5A5.5 5.5 0 0 0 12 5a5.5 5.5 0 0 0-9 4.5c0 1.5.5 3 2 4.5l7 7Z" />
                </svg>
              </span>
              <p className="ig-kpi__label">Saves</p>
            </div>
            <p className="ig-kpi__value">{data.webSaves.toLocaleString()}</p>
            <p className="ig-kpi__hint">{data.viewToSave}% of views</p>
          </article>
          <article className="ig-kpi ig-kpi--amber">
            <div className="ig-kpi__top">
              <span className="ig-kpi__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                </svg>
              </span>
              <p className="ig-kpi__label">Inquiries</p>
            </div>
            <p className="ig-kpi__value">{data.webInquiries.toLocaleString()}</p>
            <p className="ig-kpi__hint">{data.saveToInquiry}% of saves</p>
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
              <p className="ig-kpi__label">CRM leads</p>
            </div>
            <p className="ig-kpi__value">{data.leads}</p>
            <p className="ig-kpi__hint">
              {data.leadsWow >= 0 ? "+" : ""}
              {data.leadsWow}% vs prior week
            </p>
          </article>
        </div>
      </section>

      <section className="ig-tools" aria-label="Quick tools">
        <Link href="/dashboard/leads" className="ig-tool ig-tool--coral">
          <span className="ig-tool__icon" aria-hidden>
            ●
          </span>
          {data.newLeads} new leads
        </Link>
        <Link href="/dashboard/properties" className="ig-tool ig-tool--amber">
          <span className="ig-tool__icon" aria-hidden>
            ▲
          </span>
          {data.attentionList.length} need attention
        </Link>
        <Link href="/dashboard/properties" className="ig-tool ig-tool--sky">
          <span className="ig-tool__icon" aria-hidden>
            ◇
          </span>
          {data.draftCount} drafts to publish
        </Link>
        <Link href="/dashboard/properties" className="ig-tool ig-tool--teal">
          <span className="ig-tool__icon" aria-hidden>
            ★
          </span>
          {data.featuredCount} featured
        </Link>
        <AnalyticsCopyButton text={snapshot} />
      </section>

      <section className="ig-panel ig-funnel-wrap">
        <div className="ig-panel__head">
          <div>
            <h3 className="ig-panel__title">Conversion funnel</h3>
            <p className="ig-panel__sub">
              Views → saves → inquiries → closed deals
            </p>
          </div>
          <p className="ig-panel__meta">{data.inquiryToClose}% inquiry close</p>
        </div>
        <ol className="ig-funnel">
          {data.funnel.map((step, index) => {
            const icons: Record<string, ReactNode> = {
              views: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ),
              saves: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.5-1.5 2-3 2-4.5A5.5 5.5 0 0 0 12 5a5.5 5.5 0 0 0-9 4.5c0 1.5.5 3 2 4.5l7 7Z" />
                </svg>
              ),
              inquiries: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                </svg>
              ),
              closed: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
              ),
            };

            return (
              <li
                key={step.key}
                className={`ig-funnel__step ig-funnel__step--${step.tone}`}
              >
                <div className="ig-funnel__top">
                  <span className="ig-funnel__icon" aria-hidden>
                    {icons[step.key] ?? icons.views}
                  </span>
                  <p className="ig-funnel__label">{step.label}</p>
                </div>
                <p className="ig-funnel__value">{step.value.toLocaleString()}</p>
                <p className="ig-funnel__rate">
                  {index === 0 ? "Start" : `${step.rate}% convert`}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="ig-grid ig-grid--2">
        <section className="ig-panel">
          <div className="ig-panel__head">
            <div>
              <h3 className="ig-panel__title">Lead flow · 14 days</h3>
              <p className="ig-panel__sub">
                {data.leadsRecent} in last 7 days
              </p>
            </div>
            <span
              className={`ig-delta ${data.leadsWow >= 0 ? "is-up" : "is-down"}`}
            >
              {data.leadsWow >= 0 ? "▲" : "▼"} {Math.abs(data.leadsWow)}%
            </span>
          </div>
          <AreaSpark
            id="ig-leads"
            values={data.leadsTrend14.map((d) => d.value)}
            color="#e11d48"
          />
          <div className="ig-axis">
            <span>{data.leadsTrend14[0]?.label}</span>
            <span>{data.leadsTrend14[data.leadsTrend14.length - 1]?.label}</span>
          </div>
        </section>

        <section className="ig-panel">
          <div className="ig-panel__head">
            <div>
              <h3 className="ig-panel__title">New listings · 14 days</h3>
              <p className="ig-panel__sub">Inventory intake cadence</p>
            </div>
            <span className="ig-chip ig-chip--navy">
              {data.published}/{data.properties} live
            </span>
          </div>
          <AreaSpark
            id="ig-listings"
            values={data.listingsTrend.map((d) => d.value)}
            color="#0284c7"
          />
          <div className="ig-axis">
            <span>{data.listingsTrend[0]?.label}</span>
            <span>
              {data.listingsTrend[data.listingsTrend.length - 1]?.label}
            </span>
          </div>
        </section>
      </div>

      <div className="ig-grid ig-grid--health">
        <section className="ig-panel">
          <div className="ig-panel__head">
            <div>
              <h3 className="ig-panel__title">Listing health mix</h3>
              <p className="ig-panel__sub">Portfolio vitality at a glance</p>
            </div>
          </div>
          <div className="ig-stack" role="img" aria-label="Listing health mix">
            {data.healthMix.map((item) => (
              <div
                key={item.key}
                className={`ig-stack__seg ig-stack__seg--${item.tone}`}
                style={{ flexGrow: item.value || 0.0001 }}
                title={`${item.label}: ${item.value}`}
              >
                {item.value > 0 ? (
                  <span>
                    {item.label} · {item.value}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <ul className="ig-legend">
            {data.healthMix.map((item) => (
              <li key={item.key}>
                <span
                  className="ig-legend__dot"
                  style={{ background: TONE_HEX[item.tone] }}
                />
                <span>{item.label}</span>
                <strong>
                  {item.value} · {pctShare(item.value, healthTotal)}%
                </strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="ig-panel">
          <div className="ig-panel__head">
            <div>
              <h3 className="ig-panel__title">Pipeline stages</h3>
              <p className="ig-panel__sub">
                {data.pipelineActive} active · {data.closeRate}% close rate
              </p>
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
                      background: [
                        "#0284c7",
                        "#0d9488",
                        "#d97706",
                        "#65a30d",
                      ][i % 4],
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="ig-grid ig-grid--2">
        <section className="ig-panel ig-panel--tool">
          <div className="ig-panel__head">
            <div>
              <h3 className="ig-panel__title">Attention queue</h3>
              <p className="ig-panel__sub">
                Listings to fix before they go cold
              </p>
            </div>
            <Link href="/dashboard/properties" className="ig-link">
              Open inventory
            </Link>
          </div>
          {data.attentionList.length === 0 ? (
            <p className="ig-empty">All clear — no urgent listing issues.</p>
          ) : (
            <ul className="ig-queue">
              {data.attentionList.map((item) => (
                <li key={item.id} className="ig-queue__item">
                  <div className="ig-queue__score" aria-label={`Score ${item.score}`}>
                    {item.score}
                  </div>
                  <div className="ig-queue__body">
                    <p className="ig-queue__title">{item.title}</p>
                    <p className="ig-queue__meta">
                      {item.reason} · {item.daysOnMarket}d ·{" "}
                      {item.views.toLocaleString()} views · {item.leads} leads
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/properties/${item.id}`}
                    className="ig-queue__action"
                  >
                    Fix
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ig-panel">
          <div className="ig-panel__head">
            <div>
              <h3 className="ig-panel__title">Top traffic listings</h3>
              <p className="ig-panel__sub">Ranked by public page views</p>
            </div>
          </div>
          {data.topListings.length === 0 ? (
            <p className="ig-empty">No listings yet.</p>
          ) : (
            <ol className="ig-rank">
              {data.topListings.slice(0, 6).map((listing, index) => (
                <li key={listing.id} className="ig-rank__item">
                  <span className={`ig-rank__n ig-rank__n--${index + 1}`}>
                    {index + 1}
                  </span>
                  <div className="ig-rank__body">
                    <div className="ig-rank__row">
                      <p className="ig-rank__title">{listing.title}</p>
                      <span className="ig-rank__price">{listing.priceLabel}</span>
                    </div>
                    <div className="ig-rank__bar">
                      <div
                        className="ig-rank__fill"
                        style={{
                          width: `${(listing.views / maxViews) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="ig-rank__meta">
                      {listing.views.toLocaleString()} views · {listing.saves}{" "}
                      saves · score {listing.engagementScore}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="ig-grid ig-grid--3">
        <section className="ig-panel">
          <h3 className="ig-panel__title">Lead sources</h3>
          <ul className="ig-bars">
            {data.leadsBySource.length === 0 ? (
              <li className="ig-empty">Sources appear as inquiries arrive.</li>
            ) : (
              data.leadsBySource.map((item, i) => (
                <li key={item.key}>
                  <div className="ig-bars__meta">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="ig-bars__track">
                    <div
                      className="ig-bars__fill"
                      style={{
                        width: `${(item.value / maxSource) * 100}%`,
                        background: ["#1e3a5f", "#0d9488", "#d97706", "#0284c7", "#e11d48"][
                          i % 5
                        ],
                      }}
                    />
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="ig-panel">
          <h3 className="ig-panel__title">Agent attribution</h3>
          <ul className="ig-bars">
            {data.byAgent.every((a) => a.value === 0) ? (
              <li className="ig-empty">Assign agents to track lead share.</li>
            ) : (
              data.byAgent.map((item, i) => (
                <li key={item.key}>
                  <div className="ig-bars__meta">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="ig-bars__track">
                    <div
                      className="ig-bars__fill"
                      style={{
                        width: `${(item.value / maxAgent) * 100}%`,
                        background: ["#0d9488", "#0284c7", "#d97706", "#65a30d", "#e11d48", "#1e3a5f"][
                          i % 6
                        ],
                      }}
                    />
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="ig-panel">
          <h3 className="ig-panel__title">Inventory mix</h3>
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
          {data.byCategory.length > 0 ? (
            <ul className="ig-tags">
              {data.byCategory.slice(0, 6).map((cat) => (
                <li key={cat.key}>
                  {cat.label}
                  <strong>{cat.value}</strong>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      <section className="ig-insights">
        <h3 className="ig-insights__title">Coach notes</h3>
        <ul>
          {data.insights.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function pctShare(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 100);
}
