import Link from "next/link";
import { SellPropertyForm } from "@/components/site/SellPropertyForm";
import { SiteFooter, SiteHeader } from "@/components/site/Shell";

export const metadata = {
  title: "Sell",
  description:
    "Onboard your property with KeyNestOS — share details and we’ll help you list.",
};

const PROCESS = [
  {
    title: "Share your home",
    copy: "Address, type, and a few basics — takes a couple of minutes.",
  },
  {
    title: "We review & match",
    copy: "An agent looks over your details and prepares a listing plan.",
  },
  {
    title: "Go live",
    copy: "Photos, pricing, and outreach — then your home reaches buyers.",
  },
];

export default function SellPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="sell-page">
          <div className="container-wide sell-page__grid">
            <div className="sell-page__intro fade-up">
              <h1 className="heading-xl sell-page__title">
                List your property with KeyNestOS.
              </h1>
              <p className="sell-page__lead">
                A short onboarding form is all it takes. We&apos;ll handle the
                rest — from pricing to putting your home in front of the right
                buyers.
              </p>

              <ol className="sell-page__process">
                {PROCESS.map((item, i) => (
                  <li key={item.title}>
                    <span className="sell-page__process-num" aria-hidden>
                      {i + 1}
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="sell-page__aside">
                Questions before you start?{" "}
                <Link href="/contact">Talk to our team</Link>
                {" · "}
                <a href="tel:+18005550199">(800) 555-0199</a>
              </p>
            </div>

            <div className="sell-page__form-wrap fade-up">
              <SellPropertyForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
