import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/site/Hero";
import { HomeCategoryCarousel } from "@/components/site/HomeCategoryCarousel";
import { PropertyResults } from "@/components/site/PropertyResults";
import { SiteHeader } from "@/components/site/Shell";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  listAgents,
  listCategories,
  listProperties,
  listTags,
  getSettings,
} from "@/lib/db";
import { ASSETS } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const settings = getSettings();
  const properties = listProperties({ status: "published", featured: true }).slice(
    0,
    6,
  );
  const categories = listCategories();
  const tags = listTags();
  const agents = listAgents();

  return (
    <>
      <SiteHeader />
      <main>
        <Hero
          headline={settings.heroHeadline}
          support={settings.heroSupport}
          image={settings.heroImage}
        />

        <section id="properties" className="section-pad bg-white scroll-mt-[88px]">
          <div className="container-wide">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="heading-xl">{settings.featuredHeading}</h2>
              </div>
              <Link href="/properties" className="btn-secondary">
                Explore all
              </Link>
            </div>
            <PropertyResults
              properties={properties}
              categories={categories}
              tags={tags}
              showViewToggle={false}
              emptyMessage="No featured properties yet."
            />
          </div>
        </section>

        <section id="about" className="section-pad bg-[#f7f7f7] scroll-mt-[88px]">
          <div className="container-wide grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="heading-xl mb-5">{settings.aboutHeading}</h2>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-[#758696]">
                {settings.aboutText}
              </p>
              <Link href="/about" className="btn-primary">
                Read more
              </Link>
            </div>
            <div className="overflow-hidden rounded-[28px]">
              <Image
                src={settings.aboutImage}
                alt="Featured home"
                width={900}
                height={700}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container-wide">
            <div className="mb-10 max-w-2xl">
              <h2 className="heading-xl">{settings.journeyHeading}</h2>
            </div>
            <HomeCategoryCarousel categories={categories} />
          </div>
        </section>

        <section className="section-pad bg-[#0c0407] text-white">
          <div className="container-wide grid items-center gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[28px]">
              <Image
                src={settings.chooseImage || ASSETS.choose}
                alt="Why choose us"
                width={900}
                height={700}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="mb-5 text-4xl font-semibold tracking-tight md:text-5xl">
                {settings.chooseHeading}
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-white/70">
                {settings.chooseText}
              </p>
              <Link href="/contact" className="btn-white">
                Contact us
              </Link>
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container-wide">
            <div className="mb-10">
              <h2 className="heading-xl">{settings.statsHeading}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {settings.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[24px] border border-[#e8e8e8] bg-[#fafafa] p-7"
                >
                  <p className="mb-3 text-5xl font-semibold tracking-tight text-[#0c0407]">
                    {stat.value}
                  </p>
                  <h3 className="mb-3 text-lg font-semibold text-[#0c0407]">
                    {stat.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#758696]">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad bg-[#f7f7f7]">
          <div className="container-wide">
            <div className="mb-12 max-w-3xl">
              <h2 className="heading-xl">{settings.processHeading}</h2>
            </div>
            <div className="space-y-10">
              {settings.processSteps.map((item, index) => (
                <div
                  key={`${item.step}-${index}`}
                  className={`grid items-center gap-8 lg:grid-cols-2 ${
                    index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div>
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#0c0407]">
                      {item.step}
                    </p>
                    <h3 className="mb-4 text-3xl font-semibold tracking-tight text-[#0c0407]">
                      {item.title}
                    </h3>
                    <p className="text-lg leading-relaxed text-[#758696]">{item.text}</p>
                  </div>
                  <div className="overflow-hidden rounded-[28px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={800}
                      height={560}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="agents" className="section-pad overflow-hidden scroll-mt-[88px]">
          <div className="container-wide mb-10">
            <h2 className="heading-xl">{settings.agentsHeading}</h2>
          </div>
          <div className="marquee">
            <div className="marquee-track">
              {[...agents, ...agents].map((agent, i) => (
                <div
                  key={`${agent.id}-${i}`}
                  className="w-[220px] shrink-0 text-center"
                >
                  <div className="mb-4 overflow-hidden rounded-[22px]">
                    <Image
                      src={agent.image}
                      alt={agent.name}
                      width={220}
                      height={280}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-[#0c0407]">{agent.name}</h3>
                  <p className="text-sm text-[#758696]">{agent.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad bg-[#f7f7f7]">
          <div className="container-wide">
            <div className="mb-10">
              <h2 className="heading-xl">{settings.testimonialsHeading}</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {settings.testimonials.map((item) => (
                <article
                  key={item.name}
                  className="rounded-[24px] border border-[#e8e8e8] bg-white p-7"
                >
                  <h3 className="mb-4 text-2xl font-semibold tracking-tight text-[#0c0407]">
                    “{item.quote}”
                  </h3>
                  <p className="mb-6 text-[#758696]">{item.text}</p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-[#0c0407]">{item.name}</p>
                      <p className="text-sm text-[#758696]">{item.place}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container-wide">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="heading-xl">{settings.blogHeading}</h2>
              </div>
              <span className="btn-secondary">Explore All</span>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {ASSETS.blog.map((image, index) => (
                <article key={image} className="group">
                  <div className="mb-4 overflow-hidden rounded-[22px]">
                    <Image
                      src={image}
                      alt="Blog article"
                      width={640}
                      height={420}
                      className="aspect-[3/2] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="mb-2 text-sm text-[#758696]">
                    August 20, 2024 · {[14, 20, 9][index]} min read
                  </p>
                  <h3 className="text-xl font-semibold tracking-tight text-[#0c0407]">
                    Here’s how to decorate your new home from scratch
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
