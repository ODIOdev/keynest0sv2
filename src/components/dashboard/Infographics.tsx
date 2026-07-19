type SeriesItem = {
  key?: string;
  label: string;
  value: number;
};

const CHART_COLORS = [
  "#1e3a5f",
  "#3d6b9a",
  "#5b8fb8",
  "#8bb4d4",
  "#b8d4e8",
  "#94a3b8",
];

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "accent" | "success" | "warn";
}) {
  return (
    <article className={`dash-stat dash-stat--${tone}`}>
      <p className="dash-stat__label">{label}</p>
      <p className="dash-stat__value">{value}</p>
      {hint ? <p className="dash-stat__hint">{hint}</p> : null}
    </article>
  );
}

export function ProgressRing({
  value,
  max = 100,
  label,
  sublabel,
  size = 112,
}: {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  size?: number;
}) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const stroke = size < 80 ? 6 : 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div className="dash-ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--dash-track)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--dash-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="dash-ring__arc"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="dash-ring__pct"
        >
          {pct}%
        </text>
      </svg>
      <div>
        <p className="dash-ring__label">{label}</p>
        {sublabel ? <p className="dash-ring__sub">{sublabel}</p> : null}
      </div>
    </div>
  );
}

export function DonutChart({
  items,
  title,
  empty = "No data yet",
}: {
  items: SeriesItem[];
  title?: string;
  empty?: string;
}) {
  const total = items.reduce((sum, i) => sum + i.value, 0);
  const size = 160;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let cursor = 0;

  return (
    <div className="dash-chart">
      {title ? <h3 className="dash-chart__title">{title}</h3> : null}
      {total === 0 ? (
        <p className="dash-empty">{empty}</p>
      ) : (
        <div className="dash-donut">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="dash-donut__svg"
            role="img"
            aria-label={title || "Distribution chart"}
          >
            {items.map((item, i) => {
              if (item.value <= 0) return null;
              const len = (item.value / total) * c;
              const node = (
                <circle
                  key={item.key || item.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={stroke}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-cursor}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              );
              cursor += len;
              return node;
            })}
            <text
              x="50%"
              y="46%"
              textAnchor="middle"
              className="dash-donut__total"
            >
              {total}
            </text>
            <text
              x="50%"
              y="58%"
              textAnchor="middle"
              className="dash-donut__caption"
            >
              total
            </text>
          </svg>
          <ul className="dash-legend">
            {items.map((item, i) => (
              <li key={item.key || item.label}>
                <span
                  className="dash-legend__swatch"
                  style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span className="dash-legend__label">{item.label}</span>
                <span className="dash-legend__value">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function BarChart({
  items,
  title,
  empty = "No data yet",
}: {
  items: SeriesItem[];
  title?: string;
  empty?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="dash-chart">
      {title ? <h3 className="dash-chart__title">{title}</h3> : null}
      {items.every((i) => i.value === 0) ? (
        <p className="dash-empty">{empty}</p>
      ) : (
        <ul className="dash-bars">
          {items.map((item, i) => (
            <li key={item.key || item.label}>
              <div className="dash-bars__meta">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="dash-bars__track">
                <div
                  className="dash-bars__fill"
                  style={{
                    width: `${(item.value / max) * 100}%`,
                    background: CHART_COLORS[i % CHART_COLORS.length],
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Sparkline({
  values,
  labels,
  title,
}: {
  values: number[];
  labels?: string[];
  title?: string;
}) {
  const w = 280;
  const h = 72;
  const pad = 6;
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  const area = `M${pad},${h - pad} L${points.join(" L")} L${w - pad},${h - pad} Z`;

  return (
    <div className="dash-chart">
      {title ? <h3 className="dash-chart__title">{title}</h3> : null}
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="dash-spark"
        role="img"
        aria-label={title || "Trend"}
      >
        <path d={area} className="dash-spark__area" />
        <polyline
          points={points.join(" ")}
          fill="none"
          className="dash-spark__line"
        />
        {values.map((v, i) => {
          const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
          const y = h - pad - (v / max) * (h - pad * 2);
          return <circle key={i} cx={x} cy={y} r="3" className="dash-spark__dot" />;
        })}
      </svg>
      {labels ? (
        <div className="dash-spark__labels">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Pipeline({
  items,
  title,
}: {
  items: SeriesItem[];
  title?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="dash-chart">
      {title ? <h3 className="dash-chart__title">{title}</h3> : null}
      <ol className="dash-pipeline">
        {items.map((item, i) => (
          <li key={item.key || item.label}>
            <span className="dash-pipeline__step">{String(i + 1).padStart(2, "0")}</span>
            <div className="dash-pipeline__body">
              <div className="dash-pipeline__meta">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="dash-pipeline__track">
                <div
                  className="dash-pipeline__fill"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Compact horizontal funnel for dashboard headers */
export function PipelineFunnel({
  items,
  title,
}: {
  items: SeriesItem[];
  title?: string;
}) {
  const total = items.reduce((sum, i) => sum + i.value, 0);
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="dash-funnel">
      {title ? <h3 className="dash-funnel__title">{title}</h3> : null}
      {total === 0 ? (
        <p className="dash-empty">No pipeline data yet.</p>
      ) : (
        <ol className="dash-funnel__stages">
          {items.map((item, i) => {
            const height = 28 + (item.value / max) * 36;
            return (
              <li key={item.key || item.label} className="dash-funnel__stage">
                <div
                  className="dash-funnel__bar"
                  style={{
                    height: `${height}px`,
                    opacity: 0.55 + (item.value / max) * 0.45,
                  }}
                  title={`${item.label}: ${item.value}`}
                />
                <span className="dash-funnel__value">{item.value}</span>
                <span className="dash-funnel__label">{item.label}</span>
                {i < items.length - 1 ? (
                  <span className="dash-funnel__arrow" aria-hidden>
                    →
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
