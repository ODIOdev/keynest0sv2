import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site/Shell";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getSettings, listAgents } from "@/lib/db";

export const metadata = { title: "About Us" };
export const dynamic = "force-dynamic";

export default function AboutPage() {
  const settings = getSettings();
  const agents = listAgents().slice(0, 4);

  return (
    <>
      <SiteHeader />
      <main className="section-pad">
        <div className="container-wide grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="heading-xl mb-5">{settings.aboutHeading}</h1>
            <p className="mb-8 text-lg leading-relaxed text-[#758696]">
              {settings.aboutText}
            </p>
            <Link href="/contact" className="btn-primary">
              Contact us
            </Link>
          </div>
          <div className="overflow-hidden rounded-[28px]">
            <Image
              src={settings.aboutImage}
              alt="About Realfy"
              width={900}
              height={700}
              className="w-full object-cover"
            />
          </div>
        </div>
        <div className="container-wide mt-20">
          <h2 className="heading-xl mb-8">Meet a few of our agents</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {agents.map((agent) => (
              <div key={agent.id}>
                <Image
                  src={agent.image}
                  alt={agent.name}
                  width={400}
                  height={500}
                  className="mb-4 aspect-[4/5] rounded-[22px] object-cover"
                />
                <h3 className="font-semibold text-[#0c0407]">{agent.name}</h3>
                <p className="text-sm text-[#758696]">{agent.title}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
