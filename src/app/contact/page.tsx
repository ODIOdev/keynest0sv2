import { ContactForm } from "@/components/site/ContactForm";
import { SiteFooter, SiteHeader } from "@/components/site/Shell";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">Contact</p>
            <h1 className="heading-xl mb-4">Want to contact with us?</h1>
            <p className="max-w-md text-lg text-[#758696]">
              Tell us what you&apos;re looking for and our team will follow up with
              tailored property options.
            </p>
          </div>
          <ContactForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
