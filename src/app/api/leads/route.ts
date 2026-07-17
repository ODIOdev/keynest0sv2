import { NextResponse } from "next/server";
import { createLead, listLeads, updateLead, deleteLead } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(listLeads());
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const lead = createLead({
    name: String(body.name),
    email: String(body.email),
    phone: String(body.phone || ""),
    message: String(body.message),
    propertyId: body.propertyId || null,
    source: String(body.source || "website"),
  });
  return NextResponse.json(lead, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const lead = updateLead(String(body.id), body);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  deleteLead(id);
  return NextResponse.json({ ok: true });
}
