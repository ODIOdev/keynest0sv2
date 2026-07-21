import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  createProperty,
  deleteProperty,
  listProperties,
  purgeProperty,
  restoreProperty,
  updateProperty,
} from "@/lib/db";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(listProperties());
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.title || body.price === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const property = createProperty({
    title: String(body.title),
    description: String(body.description || ""),
    address: String(body.address || ""),
    city: String(body.city || ""),
    state: String(body.state || ""),
    zip: String(body.zip || ""),
    price: Number(body.price),
    listingType: body.listingType === "sell" ? "sell" : "rent",
    categoryId: body.categoryId || null,
    tagIds: Array.isArray(body.tagIds) ? body.tagIds.map(String) : [],
    lat: body.lat != null && body.lat !== "" ? Number(body.lat) : null,
    lng: body.lng != null && body.lng !== "" ? Number(body.lng) : null,
    bedrooms: Number(body.bedrooms || 0),
    bathrooms: Number(body.bathrooms || 0),
    parking: Number(body.parking || 0),
    sqft: Number(body.sqft || 0),
    images: Array.isArray(body.images) ? body.images.map(String) : [],
    featured: Boolean(body.featured),
    status: body.status || "draft",
    agentId: body.agentId || null,
  });
  return NextResponse.json(property, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const { id, ...patch } = body;
  const property = updateProperty(String(id), patch);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(property);
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const permanent = searchParams.get("permanent") === "1";
  if (permanent) {
    if (!purgeProperty(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, purged: true });
  }

  const restore = searchParams.get("restore") === "1";
  if (restore) {
    const property = restoreProperty(id);
    if (!property) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, property });
  }

  const property = deleteProperty(id);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, deletedAt: property.deletedAt });
}
