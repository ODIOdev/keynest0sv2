import Link from "next/link";
import { FaqAccordion } from "@/components/site/FaqAccordion";
import { SiteHeader } from "@/components/site/Shell";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about buying, selling, and KeyNestOS.",
};

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="section-pad bg-[#f7f7f7]">
        <div className="container-wide">
          <div className="mb-10 max-w-2xl">
            <h1 className="heading-xl mb-5">Frequently Asked Questions</h1>
            <p className="text-lg leading-relaxed text-[#758696]">
              Answers about buying, selling, and working with our team. Still
              stuck?{" "}
              <Link
                href="/contact"
                className="text-[#0c0407] underline underline-offset-2"
              >
                Contact us
              </Link>
              .
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <FaqAccordion />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
