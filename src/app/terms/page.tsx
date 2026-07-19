import { SiteFooter, SiteHeader } from "@/components/site/Shell";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for KeyNestOS.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: "By accessing or using KeyNestOS, you agree to these Terms of Service. If you do not agree, do not use the platform.",
  },
  {
    title: "2. Our service",
    body: "KeyNestOS provides tools for browsing, listing, and managing residential properties, connecting buyers, renters, sellers, and agents. We do not guarantee that any listing will sell or rent, or that any inquiry will result in a transaction.",
  },
  {
    title: "3. Accounts",
    body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Provide accurate information and notify us promptly of any unauthorized use.",
  },
  {
    title: "4. Listings and content",
    body: "Users who submit listings or other content represent that they have the right to do so and that the information is accurate. We may remove content that violates these terms, applicable law, or our policies.",
  },
  {
    title: "5. Acceptable use",
    body: "You may not misuse the platform, attempt unauthorized access, scrape data without permission, upload malware, or use KeyNestOS for unlawful or deceptive purposes.",
  },
  {
    title: "6. Intellectual property",
    body: "KeyNestOS and its branding, software, and design remain our property. You retain ownership of content you submit and grant us a license to host, display, and distribute it as needed to operate the service.",
  },
  {
    title: "7. Disclaimers",
    body: 'The service is provided "as is." To the fullest extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement. Property information may change without notice.',
  },
  {
    title: "8. Limitation of liability",
    body: "To the fullest extent permitted by law, KeyNestOS is not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or business opportunities arising from your use of the service.",
  },
  {
    title: "9. Changes",
    body: "We may update these terms from time to time. Continued use after changes take effect constitutes acceptance of the revised terms.",
  },
  {
    title: "10. Contact",
    body: "Questions about these terms? Email hello@keynestos.com.",
  },
];

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="section-pad">
        <div className="container-wide mx-auto max-w-3xl">
          <h1 className="heading-xl mb-4">Terms of Service</h1>
          <p className="mb-12 text-sm text-[#758696]">Last updated: July 17, 2026</p>

          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="mb-3 text-lg font-semibold text-[#0c0407]">
                  {section.title}
                </h2>
                <p className="leading-relaxed text-[#758696]">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
