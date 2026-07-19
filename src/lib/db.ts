import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from "fs";
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
  Tag,
} from "./types";

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

const DATA_DIR = IS_SERVERLESS
  ? path.join("/tmp", "keynest-data")
  : path.join(/*turbopackIgnore: true*/ process.cwd(), "data");

const DB_PATH = path.join(DATA_DIR, "db.json");

const UPLOAD_DIR = IS_SERVERLESS
  ? path.join("/tmp", "keynest-uploads")
  : path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");

type DbGlobal = typeof globalThis & {
  __keynestDb?: Database;
  __keynestDbMtime?: number;
};

function memoryDb() {
  return (globalThis as DbGlobal).__keynestDb;
}

function setMemoryDb(db: Database, mtime?: number) {
  const g = globalThis as DbGlobal;
  g.__keynestDb = db;
  if (mtime !== undefined) g.__keynestDbMtime = mtime;
}

function ensureDirs() {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch {
    // Serverless filesystems can be restricted; fall back to memory.
  }
}

export function getDb(): Database {
  ensureDirs();

  try {
    if (existsSync(DB_PATH)) {
      const mtime = fsStatMtime(DB_PATH);
      const cached = memoryDb();
      const cachedMtime = (globalThis as DbGlobal).__keynestDbMtime;
      if (cached && cachedMtime === mtime) return cached;

      const db = JSON.parse(readFileSync(DB_PATH, "utf-8")) as Database;
      if (!Array.isArray(db.tags)) db.tags = [];
      ensureCategorySortOrder(db);
      ensurePropertyTagIds(db);
      ensurePropertyCoords(db);
      ensurePropertyZip(db);
      ensurePlatformListingTags(db);
      ensureBrandLogo(db);
      setMemoryDb(db, mtime);
      return db;
    }
  } catch {
    // Ignore read errors and seed a fresh database.
  }

  const cached = memoryDb();
  if (cached) return cached;

  const seeded = seedDatabase();
  setMemoryDb(seeded);

  try {
    ensureDirs();
    writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2));
    setMemoryDb(seeded, fsStatMtime(DB_PATH));
  } catch {
    // Memory-only is fine on Vercel when disk writes fail.
  }

  return seeded;
}

function fsStatMtime(filePath: string) {
  return statSync(filePath).mtimeMs;
}

function saveDb(db: Database) {
  setMemoryDb(db);
  try {
    ensureDirs();
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    setMemoryDb(db, fsStatMtime(DB_PATH));
  } catch {
    // Persist in memory for the current serverless instance.
  }
}

function ensureCategorySortOrder(db: Database) {
  let dirty = false;
  db.categories.forEach((category, index) => {
    if (typeof category.sortOrder !== "number") {
      category.sortOrder = index;
      dirty = true;
    }
  });
  if (dirty) {
    try {
      writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } catch {
      // Memory-only is fine when disk writes fail.
    }
  }
}

function ensurePropertyTagIds(db: Database) {
  let dirty = false;
  db.properties.forEach((property) => {
    if (!Array.isArray(property.tagIds)) {
      property.tagIds = [];
      dirty = true;
    }
  });
  if (dirty) {
    try {
      writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } catch {
      // Memory-only is fine when disk writes fail.
    }
  }
}

function ensurePropertyCoords(db: Database) {
  let dirty = false;
  db.properties.forEach((property) => {
    if (typeof property.lat !== "number") {
      property.lat = null;
      dirty = true;
    }
    if (typeof property.lng !== "number") {
      property.lng = null;
      dirty = true;
    }
  });
  if (dirty) {
    try {
      writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } catch {
      // Memory-only is fine when disk writes fail.
    }
  }
}

function ensurePropertyZip(db: Database) {
  let dirty = false;
  db.properties.forEach((property) => {
    if (typeof property.zip !== "string") {
      property.zip = "";
      dirty = true;
    }
  });
  if (dirty) {
    try {
      writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } catch {
      // Memory-only is fine when disk writes fail.
    }
  }
}

/** Ensure Buy / Rent platform tags exist for listing-type display. */
function ensurePlatformListingTags(db: Database) {
  if (!Array.isArray(db.tags)) db.tags = [];
  const now = new Date().toISOString();
  const required = [
    {
      id: "tag_buy",
      name: "Buy",
      color: "#1e3a5f",
      description: "Platform tag for sale listings.",
    },
    {
      id: "tag_rent",
      name: "Rent",
      color: "#be123c",
      description: "Platform tag for rental listings.",
    },
  ] as const;

  let dirty = false;
  for (const spec of required) {
    const existing = db.tags.find(
      (t) => t.name.trim().toLowerCase() === spec.name.toLowerCase(),
    );
    if (existing) continue;
    db.tags.push({
      ...spec,
      createdAt: now,
      updatedAt: now,
    });
    dirty = true;
  }
  if (dirty) {
    try {
      writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } catch {
      // Memory-only is fine when disk writes fail.
    }
  }
}

function ensureBrandLogo(db: Database) {
  if (!db.settings) return;
  if (typeof db.settings.brandLogo === "string") return;
  db.settings.brandLogo = "";
  try {
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch {
    // Memory-only is fine when disk writes fail.
  }
}

export function resetDb() {
  const seeded = seedDatabase();
  saveDb(seeded);
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
  return [...getDb().categories].sort(
    (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name),
  );
}

export function getCategory(id: string) {
  return getDb().categories.find((c) => c.id === id) ?? null;
}

export function createCategory(
  input: Omit<Category, "id" | "createdAt" | "updatedAt" | "slug" | "sortOrder"> & {
    slug?: string;
    sortOrder?: number;
  },
) {
  const db = getDb();
  const now = new Date().toISOString();
  const nextOrder =
    input.sortOrder ??
    db.categories.reduce((max, c) => Math.max(max, c.sortOrder ?? 0), -1) + 1;
  const category: Category = {
    id: nanoid(10),
    name: input.name,
    slug: input.slug || slugify(input.name),
    description: input.description,
    image: input.image,
    sortOrder: nextOrder,
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

export function reorderCategories(ids: string[]) {
  const db = getDb();
  const byId = new Map(db.categories.map((c) => [c.id, c]));
  const now = new Date().toISOString();
  const ordered: Category[] = [];

  ids.forEach((id, index) => {
    const category = byId.get(id);
    if (!category) return;
    ordered.push({ ...category, sortOrder: index, updatedAt: now });
    byId.delete(id);
  });

  for (const leftover of byId.values()) {
    ordered.push({
      ...leftover,
      sortOrder: ordered.length,
      updatedAt: now,
    });
  }

  db.categories = ordered;
  saveDb(db);
  return listCategories();
}

export function deleteCategory(id: string) {
  const db = getDb();
  const category = db.categories.find((c) => c.id === id);
  if (!category) return null;
  const linkedPropertyIds = db.properties
    .filter((p) => p.categoryId === id)
    .map((p) => p.id);
  db.categories = db.categories.filter((c) => c.id !== id);
  db.properties = db.properties.map((p) =>
    p.categoryId === id ? { ...p, categoryId: null } : p,
  );
  saveDb(db);
  return { category, linkedPropertyIds };
}

export function restoreCategory(
  category: Category,
  linkedPropertyIds: string[] = [],
) {
  const db = getDb();
  if (db.categories.some((c) => c.id === category.id)) {
    return db.categories.find((c) => c.id === category.id)!;
  }
  // Avoid slug collisions if another category reused the slug
  const slugTaken = db.categories.some(
    (c) => c.slug === category.slug && c.id !== category.id,
  );
  const restored: Category = {
    ...category,
    sortOrder:
      typeof category.sortOrder === "number"
        ? category.sortOrder
        : db.categories.length,
    slug: slugTaken ? `${category.slug}-${category.id}` : category.slug,
    updatedAt: new Date().toISOString(),
  };
  db.categories.push(restored);
  const idSet = new Set(linkedPropertyIds);
  db.properties = db.properties.map((p) =>
    idSet.has(p.id) ? { ...p, categoryId: restored.id } : p,
  );
  saveDb(db);
  return restored;
}

export function listProperties(opts?: {
  featured?: boolean;
  status?: Property["status"];
  categoryId?: string;
  listingType?: Property["listingType"];
  q?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  psf?: number;
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
  if (opts?.sqft) {
    items = items.filter((p) => p.sqft >= opts.sqft!);
  }
  if (opts?.psf) {
    items = items.filter((p) => {
      if (!p.sqft) return false;
      return p.price / p.sqft >= opts.psf!;
    });
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
    tagIds: Array.isArray(input.tagIds) ? input.tagIds : [],
    zip: typeof input.zip === "string" ? input.zip : "",
    lat: typeof input.lat === "number" ? input.lat : null,
    lng: typeof input.lng === "number" ? input.lng : null,
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

export function listTags() {
  return getDb().tags.sort((a, b) => a.name.localeCompare(b.name));
}

export function getTag(id: string) {
  return getDb().tags.find((t) => t.id === id) ?? null;
}

export function createTag(
  input: Omit<Tag, "id" | "createdAt" | "updatedAt">,
) {
  const db = getDb();
  if (!db.tags) db.tags = [];
  const now = new Date().toISOString();
  const tag: Tag = {
    ...input,
    id: nanoid(10),
    createdAt: now,
    updatedAt: now,
  };
  db.tags.push(tag);
  saveDb(db);
  return tag;
}

export function updateTag(id: string, patch: Partial<Tag>) {
  const db = getDb();
  if (!db.tags) db.tags = [];
  const idx = db.tags.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  db.tags[idx] = {
    ...db.tags[idx],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  saveDb(db);
  return db.tags[idx];
}

export function deleteTag(id: string) {
  const db = getDb();
  if (!db.tags) db.tags = [];
  db.tags = db.tags.filter((t) => t.id !== id);
  db.properties = db.properties.map((p) => ({
    ...p,
    tagIds: (p.tagIds || []).filter((tagId) => tagId !== id),
  }));
  saveDb(db);
}

export function tagsForProperty(property: Property) {
  const ids = new Set(property.tagIds || []);
  return listTags().filter((tag) => ids.has(tag.id));
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

export function getDashboardAnalytics() {
  const db = getDb();
  const stats = getDashboardStats();

  const leadStatusOrder = [
    "new",
    "contacted",
    "qualified",
    "closed",
    "lost",
  ] as const;
  const leadsByStatus = leadStatusOrder.map((status) => ({
    key: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    value: db.leads.filter((l) => l.status === status).length,
  }));

  const listingTypes = (["rent", "sell"] as const).map((type) => ({
    key: type,
    label: type === "rent" ? "For rent" : "For sale",
    value: db.properties.filter((p) => p.listingType === type).length,
  }));

  const propertyStatuses = (
    ["published", "draft", "sold", "rented"] as const
  ).map((status) => ({
    key: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    value: db.properties.filter((p) => p.status === status).length,
  }));

  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const leadsTrend = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today.getTime() - (6 - i) * dayMs);
    const next = new Date(day.getTime() + dayMs);
    const count = db.leads.filter((l) => {
      const t = new Date(l.createdAt).getTime();
      return t >= day.getTime() && t < next.getTime();
    }).length;
    return {
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      value: count,
    };
  });

  const sources = new Map<string, number>();
  for (const lead of db.leads) {
    const key = lead.source || "unknown";
    sources.set(key, (sources.get(key) || 0) + 1);
  }
  const leadsBySource = [...sources.entries()]
    .map(([label, value]) => ({ key: label, label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    ...stats,
    leadsByStatus,
    listingTypes,
    propertyStatuses,
    leadsTrend,
    leadsBySource,
    publishRate:
      stats.properties === 0
        ? 0
        : Math.round((stats.published / stats.properties) * 100),
    closeRate:
      stats.leads === 0
        ? 0
        : Math.round(
            (db.leads.filter((l) => l.status === "closed").length /
              stats.leads) *
              100,
          ),
    pipelineActive: db.leads.filter((l) =>
      ["new", "contacted", "qualified"].includes(l.status),
    ).length,
    pipelineRate:
      stats.leads === 0
        ? 0
        : Math.round(
            (db.leads.filter((l) =>
              ["contacted", "qualified", "closed"].includes(l.status),
            ).length /
              stats.leads) *
              100,
          ),
  };
}

export { UPLOAD_DIR };
