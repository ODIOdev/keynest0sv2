export type NavLink = {
  href: string;
  label: string;
  id?: string;
};

export const navLinks: NavLink[] = [
  { href: "/#home", label: "Home", id: "home" },
  { href: "/#about", label: "About Us", id: "about" },
  { href: "/#properties", label: "Properties", id: "properties" },
  { href: "/#properties", label: "Buy", id: "properties" },
  { href: "/#properties", label: "Rent", id: "properties" },
  { href: "/#contact", label: "Sell", id: "contact" },
  { href: "/#contact", label: "Contact", id: "contact" },
];
