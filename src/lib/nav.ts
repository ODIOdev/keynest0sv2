export type NavLink = {
  href: string;
  label: string;
  id?: string;
  /** Opens the site chat overlay instead of navigating */
  action?: "chat";
};

/** Primary site navigation — short labels, one job each */
export const navLinks: NavLink[] = [
  { href: "/properties", label: "Listings" },
  { href: "/properties?type=sell", label: "Buy" },
  { href: "/properties?type=rent", label: "Rent" },
  { href: "/sell", label: "Sell" },
  { href: "/contact", label: "Chat", action: "chat" },
  { href: "/about", label: "About" },
];
