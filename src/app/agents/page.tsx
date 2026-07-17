import Image from "next/image";
import { SiteFooter, SiteHeader } from "@/components/site/Shell";
import { listAgents } from "@/lib/db";

export const metadata = { title: "Agents" };
export const dynamic = "force-dynamic";

export default function AgentsPage() {
  const agents = listAgents();

  return (
    <>
      <SiteHeader />
      <main className="section-pad">
        <div className="container-wide">
          <p className="eyebrow mb-4">Our Agents</p>
          <h1 className="heading-xl mb-10">Our expert agents</h1>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {agents.map((agent) => (
              <article key={agent.id}>
                <Image
                  src={agent.image}
                  alt={agent.name}
                  width={400}
                  height={500}
                  className="mb-4 aspect-[4/5] rounded-[22px] object-cover"
                />
                <h2 className="text-xl font-semibold text-[#0c0407]">{agent.name}</h2>
                <p className="mb-2 text-sm text-[#758696]">{agent.title}</p>
                <p className="text-sm text-[#758696]">{agent.email}</p>
                <p className="text-sm text-[#758696]">{agent.phone}</p>
              </article>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
