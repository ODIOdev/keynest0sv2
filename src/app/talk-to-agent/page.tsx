import { AgentTalkForm } from "@/components/site/AgentTalkForm";
import { SiteHeader } from "@/components/site/Shell";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata = {
  title: "Talk to an agent",
  description:
    "Connect with a KeyNestOS agent about buying, renting, or selling.",
};

const STEPS = [
  {
    title: "Tell us your goal",
    copy: "Buy, rent, or sell — we route you to the right specialist.",
  },
  {
    title: "Share preferences",
    copy: "Location, budget, timeline, and must-haves so matching is sharp.",
  },
  {
    title: "Meet your agent",
    copy: "Expect a personal follow-up, usually within one business day.",
  },
];

export default function TalkToAgentPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="agent-page">
          <div className="agent-page__hero">
            <div className="container-wide agent-page__hero-inner">
              <p className="agent-page__kicker">Agent match</p>
              <h1 className="agent-page__title">Talk to an agent who gets it.</h1>
              <p className="agent-page__lead">
                A detailed brief helps us pair you with the right person — not a
                generic inbox reply. Fill this out once; we handle the rest.
              </p>
            </div>
          </div>

          <div className="container-wide agent-page__body">
            <aside className="agent-page__aside">
              <ol className="agent-page__steps">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="agent-page__step">
                    <div className="agent-page__step-top">
                      <span className="agent-page__steps-num" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h2 className="agent-page__step-title">{step.title}</h2>
                    <p className="agent-page__step-copy">{step.copy}</p>
                  </li>
                ))}
              </ol>
            </aside>

            <div className="agent-page__panel">
              <div className="agent-page__panel-head">
                <h2>Agent request form</h2>
                <p>Takes about 2–3 minutes. All fields marked help us match faster.</p>
              </div>
              <AgentTalkForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
