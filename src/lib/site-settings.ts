import type { SiteSettings } from "@/lib/types";

const CDN = "https://cdn.prod.website-files.com";
const BASE = `${CDN}/670010141e02b62e6f054e13`;

const ASSETS = {
  hero: "/hero-pool-hd.jpg",
  choose: `${BASE}/67160aef4db775dfa018cac7_choose-thumb-1.jpg`,
  process: [
    `${BASE}/67018c77e82d41323b7c69ca_process-thumb-1.jpg`,
    `${BASE}/67018c7528a69477c950bea9_process-thumb-2.jpg`,
    `${BASE}/67018c75a96327a0b77b36e9_process-thumb-3.jpg`,
  ],
  testimonials: [
    `${BASE}/670224e217d36d0f9d6431a3_testimonials-thumb-1.jpg`,
    `${BASE}/670224e2dba4f045e5fbe423_testimonials-thumb-2.jpg`,
    `${BASE}/670224e2671d7cf571ff35b2_testimonials-thumb-3.jpg`,
  ],
};

/** Canonical defaults for public site content (Web Manager). */
export function defaultSiteSettings(): SiteSettings {
  return {
    brandName: "KeyNestOS",
    brandLogo: "",
    tagline: "Unlock connections. Open opportunities.",
    heroTitle: "Real-Estate",
    heroHeadline: "Homes worth coming back to.",
    heroSupport:
      "Browse curated listings, meet trusted agents, and move from first tour to keys with a clearer path.",
    heroImage: ASSETS.hero,
    aboutHeading: "The ideal way to find your dream home",
    aboutText:
      "Wake up to the sound of waves and the smell of salt air in one of our stunning coastal homes. Perfect for those seeking a serene escape, these properties offer unmatched ocean views and direct beach safe neighborhoods, and nearby schools access.",
    aboutImage: `${BASE}/67014ccc08fb3aa6c87cb90d_about-thumb-1.jpg`,
    chooseHeading: "Why we are best in Real-Estate market?",
    chooseText:
      "With our unmatched expertise, personalized service, and deep knowledge of the real estate market, we make your home buying or selling experience seamless and stress-free. Our dedicated team of professionals listens to your needs and provides tailored guidance.",
    chooseImage: ASSETS.choose,
    journeyHeading: "Start your journey to your ideal property",
    featuredHeading: "Featured properties",
    statsHeading: "The numbers behind our success",
    stats: [
      {
        label: "Properties",
        value: "200+",
        description:
          "Discover the key figures that highlight our impact in the real estate market. From satisfied clients to successful transactions",
      },
      {
        label: "Satisfied Users",
        value: "300+",
        description:
          "Take a closer look at the statistics that reflect our growth, success, and dedication to helping clients achieve their real estate goals.",
      },
      {
        label: "Happy Clients",
        value: "100%",
        description:
          "From closed deals to client satisfaction ratings, our numbers showcase the impact we’ve made in the real estate industry",
      },
      {
        label: "Follower",
        value: "900K",
        description:
          "Explore the numbers behind our real estate success, showcasing the trust clients place in us and the results we consistently deliver.",
      },
    ],
    processHeading: "Find your dream house & follow our process",
    processSteps: [
      {
        step: "Step-1",
        title: "Look for your dream home in your local area today",
        text: "Explore a carefully curated selection of stunning homes near you that perfectly match your unique lifestyle, preferences, and specific needs.",
        image: ASSETS.process[0],
      },
      {
        step: "Step-2",
        title: "Schedule a meeting with one of our agents",
        text: "Book a personalized meeting with one of our experienced agents to thoroughly explore all your options and find the perfect property.",
        image: ASSETS.process[1],
      },
      {
        step: "Step-3",
        title: "A month or less, get your ideal home",
        text: "Secure your dream home in a month or less with our expert assistance, personalized guidance, and streamlined processes.",
        image: ASSETS.process[2],
      },
    ],
    agentsHeading: "Our expert agents",
    testimonialsHeading: "Real stories from happy homeowners",
    testimonials: [
      {
        quote: "Their attention to detail market expertise made all the difference.",
        text: "Their dedication and commitment to finding the right property were evident throughout. I highly recommend their services.",
        name: "David Martinez",
        place: "San Jose, South Dakota",
        image: ASSETS.testimonials[0],
      },
      {
        quote: "An exceptional experience from start to finish!",
        text: "From the first meeting to the closing, they were professional, knowledgeable, and always available to answer our questions.",
        name: "James Thompson",
        place: "Dallas, Texas",
        image: ASSETS.testimonials[1],
      },
      {
        quote: "Exceptional service and outstanding results.",
        text: "The team’s marketing strategy and negotiation skills exceeded my expectations. I couldn’t be more pleased with the outcome.",
        name: "Olivia Carter",
        place: "Boston, Florida",
        image: ASSETS.testimonials[2],
      },
    ],
    blogHeading: "Read our latest blogs",
    socialLinks: [],
  };
}

/** Fill any missing site settings keys from defaults (keeps existing values). */
export function mergeSiteSettings(
  partial: Partial<SiteSettings> | null | undefined,
): SiteSettings {
  const defaults = defaultSiteSettings();
  if (!partial || typeof partial !== "object") return defaults;

  return {
    ...defaults,
    ...partial,
    brandLogo:
      typeof partial.brandLogo === "string" ? partial.brandLogo : defaults.brandLogo,
    stats:
      Array.isArray(partial.stats) && partial.stats.length > 0
        ? partial.stats.map((s, i) => ({
            label: s?.label ?? defaults.stats[i]?.label ?? "",
            value: s?.value ?? defaults.stats[i]?.value ?? "",
            description: s?.description ?? defaults.stats[i]?.description ?? "",
          }))
        : defaults.stats,
    processSteps:
      Array.isArray(partial.processSteps) && partial.processSteps.length > 0
        ? partial.processSteps.map((s, i) => ({
            step: s?.step ?? defaults.processSteps[i]?.step ?? `Step-${i + 1}`,
            title: s?.title ?? defaults.processSteps[i]?.title ?? "",
            text: s?.text ?? defaults.processSteps[i]?.text ?? "",
            image: s?.image ?? defaults.processSteps[i]?.image ?? "",
          }))
        : defaults.processSteps,
    testimonials:
      Array.isArray(partial.testimonials) && partial.testimonials.length > 0
        ? partial.testimonials.map((t, i) => ({
            quote: t?.quote ?? defaults.testimonials[i]?.quote ?? "",
            text: t?.text ?? defaults.testimonials[i]?.text ?? "",
            name: t?.name ?? defaults.testimonials[i]?.name ?? "",
            place: t?.place ?? defaults.testimonials[i]?.place ?? "",
            image: t?.image ?? defaults.testimonials[i]?.image ?? "",
          }))
        : defaults.testimonials,
    socialLinks: Array.isArray(partial.socialLinks)
      ? partial.socialLinks
      : defaults.socialLinks,
  };
}
