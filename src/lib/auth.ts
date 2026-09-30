import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual, createHash } from "node:crypto";
import { db } from "./db";
const cookieName = "vaidora_owner";
function secret() {
  const key = process.env.SESSION_SECRET;
  if (!key || key.length < 32)
    throw new Error(
      "Configure SESSION_SECRET with at least 32 random characters",
    );
  return new TextEncoder().encode(key);
}
export async function isAdmin() {
  const cookie = (await cookies()).get(cookieName)?.value;
  if (!cookie) return false;
  try {
    const { payload } = await jwtVerify(cookie, secret(), {
      issuer: "vaidora",
      audience: "admin",
    });
    return payload.sub === process.env.ADMIN_EMAIL;
  } catch {
    return false;
  }
}
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.APP_ORIGIN;
  if (!origin || !expected || origin !== new URL(expected).origin)
    throw new Error("Untrusted request origin");
}
const digest = (s: string) => createHash("sha256").update(s).digest();
export async function login(email: string, password: string) {
  const key = "owner-login";
  const now = new Date();
  let attempt = await db.loginAttempt.findUnique({ where: { key } });
  if (attempt && attempt.resetAt <= now) {
    await db.loginAttempt.delete({ where: { key } });
    attempt = null;
  }
  if (attempt && attempt.count >= 12)
    throw new Error("Too many attempts. Try again in 15 minutes.");
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)
    throw new Error("Owner access is not configured.");
  const matches =
    timingSafeEqual(
      digest(email.toLowerCase()),
      digest(process.env.ADMIN_EMAIL.toLowerCase()),
    ) && timingSafeEqual(digest(password), digest(process.env.ADMIN_PASSWORD));
  if (!matches) {
    await db.loginAttempt.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(Date.now() + 900000) },
      update: { count: { increment: 1 } },
    });
    throw new Error("Email or password is incorrect.");
  }
  await db.loginAttempt.deleteMany({ where: { key } });
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(process.env.ADMIN_EMAIL)
    .setIssuer("vaidora")
    .setAudience("admin")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.APP_ORIGIN?.startsWith("https://"),
    sameSite: "strict",
    maxAge: 8 * 3600,
    path: "/",
  });
}
export async function logout() {
  (await cookies()).delete(cookieName);
}
