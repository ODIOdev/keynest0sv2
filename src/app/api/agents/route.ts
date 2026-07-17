import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  createAgent,
  deleteAgent,
  listAgents,
  updateAgent,
} from "@/lib/db";

export async function GET() {
  return NextResponse.json(listAgents());
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }
  const agent = createAgent({
    name: String(body.name),
    title: String(body.title || ""),
    email: String(body.email || ""),
    phone: String(body.phone || ""),
    bio: String(body.bio || ""),
    image: String(body.image || ""),
  });
  return NextResponse.json(agent, { status: 201 });
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
  const agent = updateAgent(String(id), patch);
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  deleteAgent(id);
  return NextResponse.json({ ok: true });
}
