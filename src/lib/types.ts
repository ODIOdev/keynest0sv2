export type ListingType = "rent" | "sell";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Property = {
  id: string;
  title: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  listingType: ListingType;
  categoryId: string | null;
  tagIds: string[];
  lat: number | null;
  lng: number | null;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  sqft: number;
  images: string[];
  featured: boolean;
  status: "draft" | "published" | "sold" | "rented";
  agentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Agent = {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  bio: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: string | null;
  status: "new" | "contacted" | "qualified" | "closed" | "lost";
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type MediaAsset = {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  alt: string;
  createdAt: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type SiteSettings = {
  brandName: string;
  /** Public site logo URL (header, hero, etc.). Empty = text wordmark. */
  brandLogo: string;
  tagline: string;
  heroTitle: string;
  aboutHeading: string;
  aboutText: string;
  aboutImage: string;
  stats: { label: string; value: string; description: string }[];
};

export type Database = {
  categories: Category[];
  properties: Property[];
  agents: Agent[];
  leads: Lead[];
  media: MediaAsset[];
  tags: Tag[];
  settings: SiteSettings;
};
