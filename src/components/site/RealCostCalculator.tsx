"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_DOWN_PCT,
  DEFAULT_RATE,
  DEFAULT_TAX_RATE,
  DEFAULT_TERM_YEARS,
  computeRealCost,
  defaultHomeInsuranceMonthly,
  defaultMortgageInsuranceMonthly,
  estimateBuyingPower,
  moneyExact,
} from "@/lib/real-cost";

type RealCostCalculatorProps = {
  homePrice: number;
  state?: string;
};

function formatMoneyDisplay(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "";
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function parseMoneyInput(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  return digits === "" ? 0 : Number(digits);
}

export function RealCostCalculator({
  homePrice,
  state = "NY",
}: RealCostCalculatorProps) {
  const [editing, setEditing] = useState(false);
  const [veteransBenefits, setVeteransBenefits] = useState(false);
  const [downPaymentPct, setDownPaymentPct] = useState(DEFAULT_DOWN_PCT);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [termYears, setTermYears] = useState(DEFAULT_TERM_YEARS);
  const [taxRate, setTaxRate] = useState(DEFAULT_TAX_RATE);
  const [homeInsuranceMonthly, setHomeInsuranceMonthly] = useState(() =>
    defaultHomeInsuranceMonthly(homePrice),
  );
  const [mortgageInsuranceMonthly, setMortgageInsuranceMonthly] = useState(() =>
    defaultMortgageInsuranceMonthly(homePrice, DEFAULT_DOWN_PCT, false),
  );
  const [hoaMonthly, setHoaMonthly] = useState(0);
  const [showBuyingPower, setShowBuyingPower] = useState(false);
  const [income, setIncome] = useState(180_000);
  const [debts, setDebts] = useState(500);
  const [disclosureOpen, setDisclosureOpen] = useState(false);

  const cost = useMemo(
    () =>
      computeRealCost({
        homePrice,
        downPaymentPct,
        rate,
        termYears,
        taxRate,
        homeInsuranceMonthly,
        mortgageInsuranceMonthly,
        hoaMonthly,
        veteransBenefits,
      }),
    [
      homePrice,
      downPaymentPct,
      rate,
      termYears,
      taxRate,
      homeInsuranceMonthly,
      mortgageInsuranceMonthly,
      hoaMonthly,
      veteransBenefits,
    ],
  );

  const buyingPower = useMemo(
    () =>
      estimateBuyingPower({
        grossAnnualIncome: income,
        monthlyDebts: debts,
        downPaymentPct: veteransBenefits ? 0 : downPaymentPct,
        rate,
        termYears,
        taxRate,
        homeInsuranceMonthly,
        mortgageInsuranceMonthly,
        hoaMonthly,
        veteransBenefits,
      }),
    [
      income,
      debts,
      downPaymentPct,
      rate,
      termYears,
      taxRate,
      homeInsuranceMonthly,
      mortgageInsuranceMonthly,
      hoaMonthly,
      veteransBenefits,
    ],
  );

  const loanLabel =
    termYears === 15
      ? "15-year fixed"
      : termYears === 20
        ? "20-year fixed"
        : "30-year fixed";

  function applyFha() {
    setVeteransBenefits(false);
    setDownPaymentPct(3.5);
    setMortgageInsuranceMonthly(
      defaultMortgageInsuranceMonthly(homePrice, 3.5, false),
    );
    setEditing(true);
  }

  function applyVeterans(next: boolean) {
    setVeteransBenefits(next);
    if (next) {
      setDownPaymentPct(0);
      setMortgageInsuranceMonthly(0);
    } else if (downPaymentPct === 0) {
      setDownPaymentPct(DEFAULT_DOWN_PCT);
      setMortgageInsuranceMonthly(0);
    }
  }

  function onDownPaymentChange(next: number) {
    setDownPaymentPct(next);
    // Suggest PMI when dropping below 20% and the field is still empty.
    if (!veteransBenefits && next < 20 && mortgageInsuranceMonthly <= 0) {
      setMortgageInsuranceMonthly(
        defaultMortgageInsuranceMonthly(homePrice, next, false),
      );
    }
  }

  const rows = [
    {
      label: "Principal & interest",
      value: cost.principalAndInterest,
      color: "#0c0407",
    },
    {
      label: "Property tax",
      value: cost.propertyTax,
      color: "#1e3a5f",
    },
    {
      label: "Home insurance",
      value: cost.homeInsurance,
      color: "#3d5a80",
    },
    {
      label: "HOA fees",
      value: cost.hoaFees,
      color: "#64748b",
    },
    {
      label: "Mortgage insurance",
      value: cost.mortgageInsurance,
      color: "#94a3b8",
    },
  ];

  const chartRows = rows.filter((row) => row.value > 0);
  const monthlyTotal = Math.max(cost.monthlyTotal, 0.01);
  const closeTotal = Math.max(cost.totalDueAtClose, 0.01);
  const downShare = Math.min(100, (cost.downPayment / closeTotal) * 100);
  const closingShare = Math.min(100, (cost.closingCost / closeTotal) * 100);
  const loanShare = Math.min(
    100,
    (cost.loanAmount / Math.max(cost.homePrice, 0.01)) * 100,
  );
  const equityShare = Math.max(0, 100 - loanShare);

  // Donut geometry (viewBox 100×100, radius 36, circumference ≈ 226.2)
  const donutR = 36;
  const donutC = 2 * Math.PI * donutR;
  let donutOffset = 0;
  const donutSegments = chartRows.map((row) => {
    const len = (row.value / monthlyTotal) * donutC;
    const segment = {
      ...row,
      dash: len,
      gap: donutC - len,
      offset: -donutOffset,
      pct: (row.value / monthlyTotal) * 100,
    };
    donutOffset += len;
    return segment;
  });

  return (
    <section className="pdp-section realcost" aria-labelledby="realcost-heading">
      <div className="realcost__head">
        <div>
          <p className="realcost__eyebrow">Ownership estimate</p>
          <h2 id="realcost-heading" className="pdp-section__title">
            RealCost™ for this home
          </h2>
        </div>
        <label className="realcost__va">
          <input
            type="checkbox"
            checked={veteransBenefits}
            onChange={(e) => applyVeterans(e.target.checked)}
          />
          <span>Apply veterans benefits</span>
        </label>
      </div>

      <div className="realcost__monthly">
        <p className="realcost__monthly-amount">
          {moneyExact(cost.monthlyTotal)}
          <span>/month</span>
        </p>
        <button
          type="button"
          className="realcost__edit-btn"
          aria-expanded={editing}
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "Done" : "Edit payment"}
        </button>
      </div>

      {editing ? (
        <div className="realcost__editor">
          <label>
            <span>Down payment (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={veteransBenefits ? 0 : downPaymentPct}
              disabled={veteransBenefits}
              onChange={(e) => onDownPaymentChange(Number(e.target.value) || 0)}
            />
          </label>
          <label>
            <span>Interest rate (%)</span>
            <input
              type="number"
              min={0}
              max={20}
              step={0.001}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value) || 0)}
            />
          </label>
          <label>
            <span>Loan term</span>
            <select
              value={termYears}
              onChange={(e) => setTermYears(Number(e.target.value))}
            >
              <option value={30}>30-year fixed</option>
              <option value={20}>20-year fixed</option>
              <option value={15}>15-year fixed</option>
            </select>
          </label>
          <label>
            <span>Property tax rate (% / yr)</span>
            <input
              type="number"
              min={0}
              max={5}
              step={0.001}
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
            />
          </label>
          <div className="realcost__editor-pair">
            <label>
              <span>Home insurance ($ / mo)</span>
              <span className="realcost__money">
                <span className="realcost__money-prefix" aria-hidden>
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0"
                  value={formatMoneyDisplay(homeInsuranceMonthly)}
                  onChange={(e) =>
                    setHomeInsuranceMonthly(parseMoneyInput(e.target.value))
                  }
                  aria-label="Home insurance dollars per month"
                />
              </span>
            </label>
            <label>
              <span>Mortgage insurance ($ / mo)</span>
              <span className="realcost__money">
                <span className="realcost__money-prefix" aria-hidden>
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0"
                  value={formatMoneyDisplay(
                    veteransBenefits ? 0 : mortgageInsuranceMonthly,
                  )}
                  disabled={veteransBenefits}
                  onChange={(e) =>
                    setMortgageInsuranceMonthly(parseMoneyInput(e.target.value))
                  }
                  title={
                    veteransBenefits
                      ? "Not required with veterans benefits"
                      : "Monthly mortgage insurance (PMI)"
                  }
                  aria-label="Mortgage insurance dollars per month"
                />
              </span>
            </label>
          </div>
          <label>
            <span>HOA fees ($ / mo)</span>
            <span className="realcost__money">
              <span className="realcost__money-prefix" aria-hidden>
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                value={formatMoneyDisplay(hoaMonthly)}
                onChange={(e) => setHoaMonthly(parseMoneyInput(e.target.value))}
                aria-label="HOA fees dollars per month"
              />
            </span>
          </label>
        </div>
      ) : null}

      <dl className="realcost__summary">
        <div>
          <dt>Home price</dt>
          <dd>{moneyExact(cost.homePrice)}</dd>
        </div>
        <div>
          <dt>Loan</dt>
          <dd>
            {loanLabel} average rate of {cost.rate.toFixed(3)}%*
          </dd>
        </div>
      </dl>

      <div className="realcost__viz" aria-label="Monthly payment composition">
        <div className="realcost__donut-wrap">
          <svg
            className="realcost__donut"
            viewBox="0 0 100 100"
            role="img"
            aria-label={`Monthly payment breakdown totaling ${moneyExact(cost.monthlyTotal)}`}
          >
            <circle
              className="realcost__donut-track"
              cx="50"
              cy="50"
              r={donutR}
              fill="none"
              strokeWidth="12"
            />
            {donutSegments.map((seg) => (
              <circle
                key={seg.label}
                cx="50"
                cy="50"
                r={donutR}
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={`${seg.dash} ${seg.gap}`}
                strokeDashoffset={seg.offset}
                strokeLinecap="butt"
                transform="rotate(-90 50 50)"
              >
                <title>
                  {seg.label}: {moneyExact(seg.value)} (
                  {seg.pct.toFixed(0)}%)
                </title>
              </circle>
            ))}
          </svg>
          <div className="realcost__donut-center" aria-hidden>
            <span>Monthly</span>
            <strong>{moneyExact(cost.monthlyTotal)}</strong>
          </div>
        </div>

        <ul className="realcost__bars">
          {rows.map((row) => {
            const pct = (row.value / monthlyTotal) * 100;
            return (
              <li key={row.label}>
                <div className="realcost__bar-meta">
                  <span className="realcost__bar-label">
                    <i
                      className="realcost__swatch"
                      style={{ background: row.color }}
                      aria-hidden
                    />
                    {row.label}
                    {row.label === "Home insurance" ? (
                      <a
                        className="realcost__inline-link"
                        href="https://www.google.com/search?q=compare+home+insurance+rates"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Compare rates
                      </a>
                    ) : null}
                  </span>
                  <span className="realcost__bar-value">
                    {moneyExact(row.value)}
                    <span className="realcost__bar-pct">
                      {pct > 0 ? `${pct.toFixed(0)}%` : "—"}
                    </span>
                  </span>
                </div>
                <div
                  className="realcost__bar-track"
                  role="presentation"
                  aria-hidden
                >
                  <div
                    className="realcost__bar-fill"
                    style={{
                      width: `${Math.max(pct, row.value > 0 ? 1.5 : 0)}%`,
                      background: row.color,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="realcost__stack-card">
        <div className="realcost__stack-head">
          <div>
            <p className="realcost__stack-eyebrow">Financing mix</p>
            <p className="realcost__stack-title">
              Loan vs. equity at purchase
            </p>
          </div>
          <p className="realcost__stack-aside">
            {loanShare.toFixed(0)}% financed
          </p>
        </div>
        <div
          className="realcost__stack"
          role="img"
          aria-label={`Loan ${moneyExact(cost.loanAmount)} (${loanShare.toFixed(0)}%), down payment equity ${moneyExact(cost.downPayment)} (${equityShare.toFixed(0)}%)`}
        >
          <span
            className="realcost__stack-seg realcost__stack-seg--loan"
            style={{ width: `${loanShare}%` }}
          />
          <span
            className="realcost__stack-seg realcost__stack-seg--equity"
            style={{ width: `${equityShare}%` }}
          />
        </div>
        <ul className="realcost__stack-legend">
          <li>
            <i className="realcost__swatch realcost__swatch--loan" aria-hidden />
            <span>Loan amount</span>
            <strong>{moneyExact(cost.loanAmount)}</strong>
          </li>
          <li>
            <i
              className="realcost__swatch realcost__swatch--equity"
              aria-hidden
            />
            <span>Your equity (down)</span>
            <strong>{moneyExact(cost.downPayment)}</strong>
          </li>
        </ul>
      </div>

      <div className="realcost__close">
        <div className="realcost__close-head">
          <p>Total due at close</p>
          <strong>{moneyExact(cost.totalDueAtClose)}</strong>
        </div>
        <div
          className="realcost__stack realcost__stack--close"
          role="img"
          aria-label={`Down payment ${moneyExact(cost.downPayment)}, estimated closing costs ${moneyExact(cost.closingCost)}`}
        >
          <span
            className="realcost__stack-seg realcost__stack-seg--down"
            style={{ width: `${downShare}%` }}
          />
          <span
            className="realcost__stack-seg realcost__stack-seg--closing"
            style={{ width: `${closingShare}%` }}
          />
        </div>
        <ul>
          <li>
            <span>
              <i
                className="realcost__swatch realcost__swatch--down"
                aria-hidden
              />
              Down payment
            </span>
            <span>
              {moneyExact(cost.downPayment)} ({cost.downPaymentPct.toFixed(1)}
              %)
              {veteransBenefits ? " · VA $0 down" : ""}
            </span>
          </li>
          <li>
            <span>
              <i
                className="realcost__swatch realcost__swatch--closing"
                aria-hidden
              />
              Est. closing cost
            </span>
            <span>
              {moneyExact(cost.closingCost)} ({cost.closingPct}%)
            </span>
          </li>
        </ul>
      </div>

      <div className="realcost__cta-row">
        <p className="realcost__cta-note">Confirm your budget with a lender</p>
        <a
          className="realcost__cta"
          href={`https://www.google.com/search?q=mortgage+rates+today+${encodeURIComponent(state)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View today&apos;s rates
        </a>
      </div>

      <div className="realcost__disclosure">
        <button
          type="button"
          className="realcost__disclosure-toggle"
          aria-expanded={disclosureOpen}
          onClick={() => setDisclosureOpen((v) => !v)}
        >
          RealCost™ Disclosure
        </button>
        {disclosureOpen ? (
          <p>
            *{loanLabel} averages: {cost.apr.toFixed(3)}% APR /{" "}
            {cost.rate.toFixed(3)}% Rate. Source: RateUpdated.com. Averages are
            provided for informational purposes only and are based on averages
            for {state}. Estimates include principal & interest, property tax,
            homeowners insurance, HOA (if entered), and mortgage insurance when
            down payment is under 20%. Veterans benefits assume $0 down and no
            mortgage insurance. Not a loan offer.
          </p>
        ) : (
          <p className="realcost__disclosure-short">
            *{loanLabel} averages: {cost.apr.toFixed(3)}% APR /{" "}
            {cost.rate.toFixed(3)}% Rate. Source: RateUpdated.com. Averages are
            provided for informational purposes only and are based on averages
            for {state}. Disclosures.
          </p>
        )}
      </div>

      <div className="realcost__afford">
        <h3>Is this affordable?</h3>
        <button
          type="button"
          className="realcost__afford-btn"
          aria-expanded={showBuyingPower}
          onClick={() => setShowBuyingPower((v) => !v)}
        >
          Calculate your buying power
        </button>
        {showBuyingPower ? (
          <div className="realcost__power">
            <label>
              <span>Gross annual income</span>
              <input
                type="number"
                min={0}
                step={1000}
                value={income}
                onChange={(e) => setIncome(Number(e.target.value) || 0)}
              />
            </label>
            <label>
              <span>Other monthly debts</span>
              <input
                type="number"
                min={0}
                step={50}
                value={debts}
                onChange={(e) => setDebts(Number(e.target.value) || 0)}
              />
            </label>
            <p className="realcost__power-result">
              Estimated buying power{" "}
              <strong>{moneyExact(buyingPower)}</strong>
              {buyingPower >= homePrice ? (
                <span className="realcost__power-ok">
                  {" "}
                  — this home is within range at a 28% housing ratio.
                </span>
              ) : (
                <span className="realcost__power-warn">
                  {" "}
                  — this home is above that estimate; adjust income, debts, or
                  down payment.
                </span>
              )}
            </p>
          </div>
        ) : null}
      </div>

      <div className="realcost__help">
        <h3>Help buying this home</h3>
        <article className="realcost__help-card">
          <div>
            <h4>FHA Loans</h4>
            <p>Down payment as low as 3.5%. Lower credit scores accepted.</p>
          </div>
          <button type="button" className="realcost__help-btn" onClick={applyFha}>
            Try 3.5% down
          </button>
        </article>
        <article className="realcost__help-card">
          <div>
            <h4>Down payment assistance</h4>
            <p>
              No down payment assistance programs are available for this home or
              area.
            </p>
            <p className="realcost__help-source">
              Information provided by Down Payment Resource®.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
