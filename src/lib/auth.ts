import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "nexus_session";
const SESSION_DURATION_SEC = 60 * 60 * 24 * 7; // 7 дней

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET не задан или слишком короткий. Сгенерируйте: openssl rand -base64 32"
    );
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  adminId: string;
  email: string;
}

/** Создаёт httpOnly cookie сессии администратора */
export async function createSession(adminId: string, email: string) {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SEC}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SEC,
  });
}

/** Удаляет cookie сессии (выход) */
export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Проверяет сессию на сервере.
 * Возвращает payload или null. Используется в Server Components и API routes —
 * проверка прав администратора всегда выполняется на сервере.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return { adminId: payload.sub, email: String(payload.email ?? "") };
  } catch {
    return null;
  }
}

/** Проверяет, что сессия принадлежит существующему администратору */
export async function requireAdmin(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: { id: true },
  });
  return admin ? session : null;
}
