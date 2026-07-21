import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { BrandProvider } from "@/components/site/BrandProvider";
import { SmoothScrollProvider } from "@/components/site/SmoothScrollProvider";
import { ChatProvider } from "@/components/site/ChatWidget";
import { SitePreloader } from "@/components/site/SitePreloader";
import { SiteViewport } from "@/components/site/SiteViewport";
import { getSettings } from "@/lib/db";
import { getPublicSocialLinks } from "@/lib/public-social";
import "./globals.css";

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "KeyNestOS — Real Estate for Realtors & Brokers",
    template: "%s · KeyNestOS",
  },
  description:
    "Buy and sell your dream home with KeyNestOS. Property listings, agents, and broker CRM in one place.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = getSettings();
  const socialLinks = await getPublicSocialLinks();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <BrandProvider
          brandName={settings.brandName}
          brandLogo={settings.brandLogo || null}
          socialLinks={socialLinks}
        >
          <SmoothScrollProvider>
            <SitePreloader />
            <ChatProvider>
              <SiteViewport>{children}</SiteViewport>
            </ChatProvider>
          </SmoothScrollProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
