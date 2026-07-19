"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ASSETS } from "@/lib/seed";
import { KeynestLogo } from "@/components/site/KeynestLogo";
import { PropertySearch } from "@/components/site/PropertySearch";

type HeroProps = {
  headline: string;
  support: string;
};

export function Hero({ headline, support }: HeroProps) {
  return (
    <section id="home" className="hero-modern">
      <div className="hero-modern__media">
        <Image
          src={ASSETS.hero}
          alt="Modern home exterior"
          fill
          priority
          quality={90}
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
            <Link href="/talk-to-agent" className="btn-primary">
              Talk to agent
            </Link>
          </div>
        </div>

        <Suspense fallback={<div className="hero-search hero-search--hero" />}>
          <PropertySearch variant="hero" />
        </Suspense>
      </div>
    </section>
  );
}
