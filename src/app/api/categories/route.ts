import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  createCategory,
  deleteCategory,
  listCategories,
  reorderCategories,
  restoreCategory,
  updateCategory,
} from "@/lib/db";
import type { Category } from "@/lib/types";

export async function GET() {
  return NextResponse.json(listCategories());
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  if (body.restore && body.category) {
    const category = restoreCategory(
      body.category as Category,
      Array.isArray(body.linkedPropertyIds)
        ? body.linkedPropertyIds.map(String)
        : [],
    );
    return NextResponse.json(category, { status: 201 });
  }

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

  if (Array.isArray(body.order)) {
    const categories = reorderCategories(body.order.map(String));
    return NextResponse.json(categories);
  }

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
  const result = deleteCategory(id);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}
