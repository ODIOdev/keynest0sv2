import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { seedDatabase } from "./seed";
import type {
  Agent,
  Category,
  Database,
  Lead,
  MediaAsset,
  Property,
  SiteSettings,
} from "./types";

const DATA_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const UPLOAD_DIR = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "public",
  "uploads",
);

function ensureDirs() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function getDb(): Database {
  ensureDirs();
  if (!existsSync(DB_PATH)) {
    const seeded = seedDatabase();
    writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2));
    return seeded;
  }
  return JSON.parse(readFileSync(DB_PATH, "utf-8")) as Database;
}

function saveDb(db: Database) {
  ensureDirs();
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function resetDb() {
  ensureDirs();
  const seeded = seedDatabase();
  writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2));
  return seeded;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getSettings() {
  return getDb().settings;
}

export function updateSettings(patch: Partial<SiteSettings>) {
  const db = getDb();
  db.settings = { ...db.settings, ...patch };
  saveDb(db);
  return db.settings;
}

export function listCategories() {
  return getDb().categories.sort((a, b) => a.name.localeCompare(b.name));
}

export function getCategory(id: string) {
  return getDb().categories.find((c) => c.id === id) ?? null;
}

export function createCategory(
  input: Omit<Category, "id" | "createdAt" | "updatedAt" | "slug"> & {
    slug?: string;
  },
) {
  const db = getDb();
  const now = new Date().toISOString();
  const category: Category = {
    id: nanoid(10),
    name: input.name,
    slug: input.slug || slugify(input.name),
    description: input.description,
    image: input.image,
    createdAt: now,
    updatedAt: now,
  };
  db.categories.push(category);
  saveDb(db);
  return category;
}

export function updateCategory(id: string, patch: Partial<Category>) {
  const db = getDb();
  const idx = db.categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  db.categories[idx] = {
    ...db.categories[idx],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  saveDb(db);
  return db.categories[idx];
}

export function deleteCategory(id: string) {
  const db = getDb();
  db.categories = db.categories.filter((c) => c.id !== id);
  db.properties = db.properties.map((p) =>
    p.categoryId === id ? { ...p, categoryId: null } : p,
  );
  saveDb(db);
}

export function listProperties(opts?: {
  featured?: boolean;
  status?: Property["status"];
  categoryId?: string;
  listingType?: Property["listingType"];
  q?: string;
  beds?: number;
  baths?: number;
}) {
  let items = getDb().properties;
  if (opts?.featured !== undefined) {
    items = items.filter((p) => p.featured === opts.featured);
  }
  if (opts?.status) {
    items = items.filter((p) => p.status === opts.status);
  }
  if (opts?.categoryId) {
    items = items.filter((p) => p.categoryId === opts.categoryId);
  }
  if (opts?.listingType) {
    items = items.filter((p) => p.listingType === opts.listingType);
  }
  if (opts?.q) {
    const q = opts.q.toLowerCase();
    items = items.filter((p) =>
      [p.title, p.address, p.city, p.state, p.description]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }
  if (opts?.beds) {
    items = items.filter((p) => p.bedrooms >= opts.beds!);
  }
  if (opts?.baths) {
    items = items.filter((p) => p.bathrooms >= opts.baths!);
  }
  return items.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getProperty(idOrSlug: string) {
  const db = getDb();
  return (
    db.properties.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null
  );
}

export function createProperty(
  input: Omit<Property, "id" | "createdAt" | "updatedAt" | "slug"> & {
    slug?: string;
  },
) {
  const db = getDb();
  const now = new Date().toISOString();
  const property: Property = {
    ...input,
    id: nanoid(10),
    slug: input.slug || slugify(input.title),
    createdAt: now,
    updatedAt: now,
  };
  db.properties.push(property);
  saveDb(db);
  return property;
}

export function updateProperty(id: string, patch: Partial<Property>) {
  const db = getDb();
  const idx = db.properties.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.properties[idx] = {
    ...db.properties[idx],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  saveDb(db);
  return db.properties[idx];
}

export function deleteProperty(id: string) {
  const db = getDb();
  db.properties = db.properties.filter((p) => p.id !== id);
  saveDb(db);
}

export function listAgents() {
  return getDb().agents;
}

export function getAgent(id: string) {
  return getDb().agents.find((a) => a.id === id) ?? null;
}

export function createAgent(
  input: Omit<Agent, "id" | "createdAt" | "updatedAt">,
) {
  const db = getDb();
  const now = new Date().toISOString();
  const agent: Agent = { ...input, id: nanoid(10), createdAt: now, updatedAt: now };
  db.agents.push(agent);
  saveDb(db);
  return agent;
}

export function updateAgent(id: string, patch: Partial<Agent>) {
  const db = getDb();
  const idx = db.agents.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  db.agents[idx] = {
    ...db.agents[idx],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  saveDb(db);
  return db.agents[idx];
}

export function deleteAgent(id: string) {
  const db = getDb();
  db.agents = db.agents.filter((a) => a.id !== id);
  saveDb(db);
}

export function listLeads() {
  return getDb().leads.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function createLead(
  input: Omit<Lead, "id" | "createdAt" | "updatedAt" | "status"> & {
    status?: Lead["status"];
  },
) {
  const db = getDb();
  const now = new Date().toISOString();
  const lead: Lead = {
    ...input,
    id: nanoid(10),
    status: input.status || "new",
    createdAt: now,
    updatedAt: now,
  };
  db.leads.push(lead);
  saveDb(db);
  return lead;
}

export function updateLead(id: string, patch: Partial<Lead>) {
  const db = getDb();
  const idx = db.leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  db.leads[idx] = {
    ...db.leads[idx],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  saveDb(db);
  return db.leads[idx];
}

export function deleteLead(id: string) {
  const db = getDb();
  db.leads = db.leads.filter((l) => l.id !== id);
  saveDb(db);
}

export function listMedia() {
  return getDb().media.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function addMedia(
  input: Omit<MediaAsset, "id" | "createdAt">,
) {
  const db = getDb();
  const asset: MediaAsset = {
    ...input,
    id: nanoid(10),
    createdAt: new Date().toISOString(),
  };
  db.media.push(asset);
  saveDb(db);
  return asset;
}

export function deleteMedia(id: string) {
  const db = getDb();
  db.media = db.media.filter((m) => m.id !== id);
  saveDb(db);
}

export function getDashboardStats() {
  const db = getDb();
  return {
    properties: db.properties.length,
    published: db.properties.filter((p) => p.status === "published").length,
    categories: db.categories.length,
    agents: db.agents.length,
    leads: db.leads.length,
    newLeads: db.leads.filter((l) => l.status === "new").length,
    media: db.media.length,
  };
}

export { UPLOAD_DIR };
