import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "nexus_session";
const SESSION_DURATION_SEC = 60 * 60 * 24 * 7; // 7 дней

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET не задан или слишком короткий. Задайте переменную окружения SESSION_SECRET (минимум 16 символов)."
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Пароль администратора читается ТОЛЬКО из переменной окружения ADD_PASSWORD.
 * Сам пароль нигде не сохраняется и не попадает в браузер.
 */
function getAdminPassword(): string {
  const password = process.env.ADD_PASSWORD;
  if (!password) {
    throw new Error(
      "ADD_PASSWORD не задан. Вход в админку невозможен без этой переменной окружения."
    );
  }
  return password;
}

/**
 * Проверка пароля без раскрытия времени сравнения (timing-safe).
 * Сравниваем SHA-256 хэши, чтобы длина пароля не влияла на результат.
 */
export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  const hashInput = createHash("sha256").update(password, "utf8").digest();
  const hashExpected = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(hashInput, hashExpected);
}

export interface SessionPayload {
  adminId: string;
  email: string;
}

/** Создаёт httpOnly cookie сессии администратора */
export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
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
    return { adminId: payload.sub, email: String(payload.email ?? "admin") };
  } catch {
    return null;
  }
}

/**
 * Проверяет, что запрос от авторизованного администратора.
 * Сессия валидна по подписи JWT — дополнительных обращений к БД нет.
 */
export async function requireAdmin(): Promise<SessionPayload | null> {
  return getSession();
}
