import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { SmoothScrollProvider } from "@/components/site/SmoothScrollProvider";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
