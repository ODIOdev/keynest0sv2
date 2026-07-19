import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createTag, deleteTag, listTags, updateTag } from "@/lib/db";

export async function GET() {
  return NextResponse.json(listTags());
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }
  const tag = createTag({
    name: String(body.name).trim(),
    color: String(body.color || "#1e3a5f"),
    description: String(body.description || ""),
  });
  return NextResponse.json(tag, { status: 201 });
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
  const tag = updateTag(String(id), {
    ...(patch.name !== undefined ? { name: String(patch.name).trim() } : {}),
    ...(patch.color !== undefined ? { color: String(patch.color) } : {}),
    ...(patch.description !== undefined
      ? { description: String(patch.description) }
      : {}),
  });
  if (!tag) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(tag);
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  deleteTag(id);
  return NextResponse.json({ ok: true });
}
