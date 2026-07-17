import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { isAuthenticated } from "@/lib/auth";
import { addMedia, listMedia, UPLOAD_DIR, deleteMedia } from "@/lib/db";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(listMedia());
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${nanoid(12)}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  await writeFile(filepath, bytes);

  const url = `/uploads/${filename}`;
  const asset = addMedia({
    filename: file.name,
    url,
    size: bytes.length,
    mimeType: file.type || "application/octet-stream",
    alt,
  });

  return NextResponse.json(asset, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  deleteMedia(id);
  return NextResponse.json({ ok: true });
}
