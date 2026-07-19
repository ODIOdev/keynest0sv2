/** RealCost™-style ownership estimate helpers */

export const DEFAULT_RATE = 6.55;
export const DEFAULT_APR = 6.589;
export const DEFAULT_TERM_YEARS = 30;
export const DEFAULT_DOWN_PCT = 20;
export const DEFAULT_CLOSING_PCT = 4;
/** Annual property tax as % of home price (editable in calculator). */
export const DEFAULT_TAX_RATE = 0.843;
/** Annual homeowners insurance as % of home price. */
export const DEFAULT_INSURANCE_RATE = 0.32;
/** Annual PMI as % of loan when down payment is under 20%. */
export const DEFAULT_PMI_RATE = 0.55;

export type RealCostInputs = {
  homePrice: number;
  downPaymentPct: number;
  rate: number;
  termYears: number;
  taxRate: number;
  /** Monthly homeowners insurance in dollars. */
  homeInsuranceMonthly: number;
  /** Monthly mortgage insurance (PMI) in dollars. */
  mortgageInsuranceMonthly: number;
  hoaMonthly: number;
  veteransBenefits: boolean;
};

export type RealCostBreakdown = {
  homePrice: number;
  loanAmount: number;
  downPayment: number;
  downPaymentPct: number;
  closingCost: number;
  closingPct: number;
  totalDueAtClose: number;
  principalAndInterest: number;
  propertyTax: number;
  homeInsurance: number;
  hoaFees: number;
  mortgageInsurance: number;
  monthlyTotal: number;
  rate: number;
  apr: number;
  termYears: number;
};

export function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function moneyExact(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

/** Standard fixed-rate monthly principal & interest. */
export function monthlyPrincipalAndInterest(
  loanAmount: number,
  annualRatePct: number,
  termYears: number,
) {
  if (loanAmount <= 0) return 0;
  const n = Math.max(1, Math.round(termYears * 12));
  if (annualRatePct <= 0) return loanAmount / n;
  const r = annualRatePct / 100 / 12;
  const factor = Math.pow(1 + r, n);
  return (loanAmount * (r * factor)) / (factor - 1);
}

/** Suggested monthly homeowners insurance from home price. */
export function defaultHomeInsuranceMonthly(homePrice: number) {
  return Math.round((Math.max(0, homePrice) * DEFAULT_INSURANCE_RATE) / 100 / 12);
}

/** Suggested monthly PMI from loan amount (0 if not needed). */
export function defaultMortgageInsuranceMonthly(
  homePrice: number,
  downPaymentPct: number,
  veteransBenefits = false,
) {
  if (veteransBenefits || downPaymentPct >= 20) return 0;
  const loan = Math.max(0, homePrice * (1 - downPaymentPct / 100));
  return Math.round((loan * DEFAULT_PMI_RATE) / 100 / 12);
}

export function computeRealCost(
  inputs: RealCostInputs,
  opts?: { closingPct?: number; apr?: number },
): RealCostBreakdown {
  const homePrice = Math.max(0, inputs.homePrice);
  const closingPct = opts?.closingPct ?? DEFAULT_CLOSING_PCT;
  const apr = opts?.apr ?? DEFAULT_APR;

  let downPct = Math.min(100, Math.max(0, inputs.downPaymentPct));
  if (inputs.veteransBenefits) downPct = 0;

  const downPayment = (homePrice * downPct) / 100;
  const loanAmount = Math.max(0, homePrice - downPayment);
  const closingCost = (homePrice * closingPct) / 100;

  const principalAndInterest = monthlyPrincipalAndInterest(
    loanAmount,
    inputs.rate,
    inputs.termYears,
  );
  const propertyTax = (homePrice * inputs.taxRate) / 100 / 12;
  const homeInsurance = Math.max(0, inputs.homeInsuranceMonthly);
  const hoaFees = Math.max(0, inputs.hoaMonthly);

  // Veterans benefits remove MI; otherwise use the editable monthly amount.
  const mortgageInsurance = inputs.veteransBenefits
    ? 0
    : Math.max(0, inputs.mortgageInsuranceMonthly);

  const monthlyTotal =
    principalAndInterest +
    propertyTax +
    homeInsurance +
    hoaFees +
    mortgageInsurance;

  return {
    homePrice,
    loanAmount,
    downPayment,
    downPaymentPct: downPct,
    closingCost,
    closingPct,
    totalDueAtClose: downPayment + closingCost,
    principalAndInterest,
    propertyTax,
    homeInsurance,
    hoaFees,
    mortgageInsurance,
    monthlyTotal,
    rate: inputs.rate,
    apr,
    termYears: inputs.termYears,
  };
}

/**
 * Rough buying-power estimate: max home price from gross monthly income
 * using a 28% front-end housing ratio and the current payment assumptions.
 */
export function estimateBuyingPower(opts: {
  grossAnnualIncome: number;
  monthlyDebts: number;
  downPaymentPct: number;
  rate: number;
  termYears: number;
  taxRate: number;
  homeInsuranceMonthly: number;
  mortgageInsuranceMonthly: number;
  hoaMonthly: number;
  veteransBenefits: boolean;
}) {
  const grossMonthly = opts.grossAnnualIncome / 12;
  if (grossMonthly <= 0) return 0;

  const maxHousing = grossMonthly * 0.28;
  const maxPiti = Math.max(0, maxHousing - opts.monthlyDebts);

  // Binary search home price that yields monthlyTotal ≈ maxPiti
  let lo = 0;
  let hi = Math.max(500_000, grossMonthly * 200);
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const cost = computeRealCost({
      homePrice: mid,
      downPaymentPct: opts.downPaymentPct,
      rate: opts.rate,
      termYears: opts.termYears,
      taxRate: opts.taxRate,
      homeInsuranceMonthly: opts.homeInsuranceMonthly,
      mortgageInsuranceMonthly: opts.mortgageInsuranceMonthly,
      hoaMonthly: opts.hoaMonthly,
      veteransBenefits: opts.veteransBenefits,
    });
    if (cost.monthlyTotal > maxPiti) hi = mid;
    else lo = mid;
  }
  return Math.round(lo / 1000) * 1000;
}
