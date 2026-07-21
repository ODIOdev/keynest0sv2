import Link from "next/link";
import { ContactForm } from "@/components/site/ContactForm";
import { SiteHeader } from "@/components/site/Shell";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with the KeyNestOS team about buying, renting, selling, or support.",
};

const CHANNELS = [
  {
    label: "Email",
    value: "hello@keynestos.com",
    href: "mailto:hello@keynestos.com",
    hint: "Best for detailed questions",
  },
  {
    label: "Phone",
    value: "(800) 555-0199",
    href: "tel:+18005550199",
    hint: "Mon–Fri, 9am–6pm",
  },
  {
    label: "Visit",
    value: "Book a call with an agent",
    href: "/talk-to-agent",
    hint: "For buy · rent · sell matching",
  },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="contact-page">
          <div className="container-wide contact-page__body">
            <aside className="contact-page__aside">
              <div className="contact-page__intro">
                <p className="contact-page__kicker">Contact</p>
                <h1 className="contact-page__title">
                  Let&apos;s talk about your next move.
                </h1>
                <p className="contact-page__lead">
                  Questions about a listing, partnership, or your account — send
                  a note and the right person on our team will follow up.
                </p>
              </div>

              <ul className="contact-page__channels">
                {CHANNELS.map((ch) => (
                  <li key={ch.label}>
                    <p className="contact-page__channel-label">{ch.label}</p>
                    <a className="contact-page__channel-value" href={ch.href}>
                      {ch.value}
                    </a>
                    <p className="contact-page__channel-hint">{ch.hint}</p>
                  </li>
                ))}
              </ul>

              <div className="contact-page__note">
                <p className="contact-page__note-title">Looking for an agent?</p>
                <p className="contact-page__note-copy">
                  Use the agent request form for buy, rent, or sell matching —
                  it&apos;s built for a faster handoff.
                </p>
                <Link href="/talk-to-agent" className="contact-page__note-link">
                  Talk to an agent →
                </Link>
              </div>

              <p className="contact-page__links">
                <Link href="/properties">Browse properties</Link>
                <span aria-hidden>·</span>
                <Link href="/faq">FAQ</Link>
                <span aria-hidden>·</span>
                <Link href="/agents">Our agents</Link>
              </p>
            </aside>

            <div className="contact-page__panel">
              <div className="contact-page__panel-head">
                <h2>Send a message</h2>
                <p>Pick a topic so we route your note to the right inbox.</p>
              </div>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
