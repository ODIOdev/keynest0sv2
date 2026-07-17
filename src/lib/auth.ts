import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "realfy_admin_session";

function secret() {
  return process.env.ADMIN_SECRET || "realfy-dev-secret-change-me";
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function verifyCredentials(password: string) {
  return password === adminPassword();
}

export async function createSession() {
  const payload = `admin:${Date.now()}`;
  const token = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAuthenticated() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
