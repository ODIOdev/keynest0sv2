import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/lib/db";

export async function GET() {
  return NextResponse.json(listCategories());
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }
  const category = createCategory({
    name: String(body.name),
    description: String(body.description || ""),
    image: String(body.image || ""),
    slug: body.slug ? String(body.slug) : undefined,
  });
  return NextResponse.json(category, { status: 201 });
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
  const category = updateCategory(String(id), patch);
  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  deleteCategory(id);
  return NextResponse.json({ ok: true });
}
