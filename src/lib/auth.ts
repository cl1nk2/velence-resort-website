import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "vr_admin";
const TTL = 60 * 60 * 8;

function secret() {
  const s = process.env.SESSION_SECRET ?? (process.env.ADMIN_PASSWORD ? `vr:${process.env.ADMIN_PASSWORD}:session` : "");
  return s ? new TextEncoder().encode(s) : null;
}

export const adminEnabled = () => !!process.env.ADMIN_PASSWORD;

export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare fixed-length digests so timing does not leak length or content.
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function createSession() {
  const key = secret();
  if (!key) throw new Error("Admin is not configured");
  const token = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${TTL}s`).sign(key);
  (await cookies()).set(ADMIN_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: TTL });
}

export async function destroySession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function isAdmin() {
  const key = secret();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!key || !token) return false;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
