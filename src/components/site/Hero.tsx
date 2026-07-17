"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { ASSETS } from "@/lib/seed";
import { KeynestLogo } from "@/components/site/KeynestLogo";
import { ScrollLink } from "@/components/site/SmoothNav";
import { useSmoothScroll } from "@/components/site/SmoothScrollProvider";

type HeroProps = {
  headline: string;
  support: string;
};

type SearchMode = "buy" | "rent" | "sell";

export function Hero({ headline, support }: HeroProps) {
  const router = useRouter();
  const { scrollToId } = useSmoothScroll();
  const sectionRef = useRef<HTMLElement>(null);
  const [fade, setFade] = useState(0);
  const [mode, setMode] = useState<SearchMode>("buy");
  const [location, setLocation] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const updateFade = (scrollY: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.offsetTop;
    const height = el.offsetHeight;
    const progress = (scrollY - top) / (height * 0.75);
    setFade(Math.min(1, Math.max(0, progress)));
  };

  useLenis(({ scroll }) => {
    updateFade(scroll);
  });

  useEffect(() => {
    updateFade(window.scrollY || 0);
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    if (mode === "sell") {
      if (window.location.pathname === "/") {
        scrollToId("contact");
        window.history.replaceState(null, "", "/#contact");
      } else {
        router.push("/#contact");
      }
      return;
    }
    const params = new URLSearchParams();
    if (mode === "rent") params.set("type", "rent");
    if (mode === "buy") params.set("type", "sell");
    if (location.trim()) params.set("q", location.trim());
    if (beds) params.set("beds", beds);
    if (baths) params.set("baths", baths);
    const query = params.toString();
    router.push(query ? `/properties?${query}` : "/properties");
  }

  return (
    <section id="home" className="hero-modern" ref={sectionRef}>
      <div className="hero-modern__media">
        <Image
          src={ASSETS.hero}
          alt="Modern home exterior"
          fill
          priority
          sizes="100vw"
          className="hero-modern__image"
        />
        <div className="hero-modern__shade" aria-hidden />
        <div className="hero-modern__grain" aria-hidden />
      </div>

      <div className="hero-modern__content">
        <div className="hero-modern__copy">
          <div className="hero-modern__brand kn-logo--on-dark">
            <KeynestLogo size="md" className="kn-logo--hero" />
          </div>
          <h1 className="hero-modern__headline">{headline}</h1>
          <p className="hero-modern__support">{support}</p>
          <div className="hero-modern__actions">
            <ScrollLink href="/#properties" className="btn-primary">
              Browse properties
            </ScrollLink>
            <ScrollLink href="/#contact" className="hero-modern__ghost">
              Talk to an agent
            </ScrollLink>
          </div>
        </div>

        <form className="hero-search" onSubmit={onSearch}>
          <div className="hero-search__tabs" role="tablist" aria-label="Search type">
            {(
              [
                ["buy", "Buy"],
                ["rent", "Rent"],
                ["sell", "Sell"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                className={`hero-search__tab${mode === value ? " is-active" : ""}`}
                onClick={() => {
                  setMode(value);
                  setBeds("");
                  setBaths("");
                  setPropertyType("");
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hero-search__fields">
            <label className="hero-search__field hero-search__field--grow">
              <span>{mode === "sell" ? "Property address" : "Location"}</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={
                  mode === "sell"
                    ? "Street, city, or ZIP"
                    : "City, neighborhood, or ZIP"
                }
              />
            </label>
            {mode === "sell" ? (
              <label className="hero-search__field hero-search__field--grow">
                <span>Type</span>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhome">Townhome</option>
                  <option value="land">Land</option>
                </select>
              </label>
            ) : (
              <>
                <label className="hero-search__field">
                  <span>Beds</span>
                  <select value={beds} onChange={(e) => setBeds(e.target.value)}>
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </label>
                <label className="hero-search__field">
                  <span>Baths</span>
                  <select
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </label>
              </>
            )}
            <button type="submit" className="hero-search__submit">
              {mode === "sell" ? "Start selling" : "Search"}
            </button>
          </div>
        </form>
      </div>

      <div
        className="hero-modern__scroll-fade"
        aria-hidden
        style={{ opacity: fade }}
      />
    </section>
  );
}
