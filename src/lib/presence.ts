import { createHash, randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { ONLINE_WINDOW_MS } from "@/lib/heartbeat";

/** Имя cookie анонимного посетителя */
export const VISITOR_COOKIE = "nexus_visitor";
/** Срок жизни cookie посетителя (30 дней) */
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Проверяет, что токен посетителя имеет формат UUID */
export function isValidVisitorToken(token: string): boolean {
  return UUID_RE.test(token);
}

/** Генерирует анонимный токен посетителя */
export function newVisitorToken(): string {
  return randomUUID();
}

/**
 * Хэш токена сессии администратора (sha256).
 * В базу попадает только хэш — сам токен нигде не сохраняется.
 */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function onlineCutoff(now = Date.now()): Date {
  return new Date(now - ONLINE_WINDOW_MS);
}

/**
 * Обновляет время активности посетителя (upsert по анонимному токен).
 * Частота ограничена на сервере: не чаще одного обновления в 15 секунд на токен.
 */
export async function touchVisitor(token: string): Promise<void> {
  const now = new Date();
  const existing = await prisma.visitorActivity.findUnique({
    where: { token },
    select: { lastSeenAt: true },
  });
  if (existing && now.getTime() - existing.lastSeenAt.getTime() < 15_000) {
    return; // тише — база не перегружается спамом
  }
  await prisma.visitorActivity.upsert({
    where: { token },
    create: { token, lastSeenAt: now },
    update: { lastSeenAt: now },
  });
  await maybeCleanup();
}

/** Снимает посетителя с онлайна (закрытие вкладки) */
export async function removeVisitor(token: string): Promise<void> {
  await prisma.visitorActivity.deleteMany({ where: { token } });
}

/**
 * Обновляет активность администратора.
 * Одна запись = одна браузерная сессия (ключ — хэш токена сессии).
 */
export async function touchAdminActivity(
  adminId: string,
  sessionToken: string,
  userAgent: string | null
): Promise<void> {
  const sessionKey = hashSessionToken(sessionToken);
  const now = new Date();
  const ua = userAgent ? userAgent.slice(0, 200) : null;
  await prisma.adminActivity.upsert({
    where: { sessionKey },
    create: { adminId, sessionKey, userAgent: ua, lastSeenAt: now },
    update: { lastSeenAt: now, userAgent: ua },
  });
  await maybeCleanup();
}

/** Убирает активность сессии администратора (выход из аккаунта) */
export async function removeAdminActivity(sessionToken: string): Promise<void> {
  await prisma.adminActivity.deleteMany({
    where: { sessionKey: hashSessionToken(sessionToken) },
  });
}

/** Количество посетителей онлайн (heartbeat не старше окна) */
export async function countOnlineVisitors(): Promise<number> {
  return prisma.visitorActivity.count({
    where: { lastSeenAt: { gte: onlineCutoff() } },
  });
}

export interface OnlineAdmin {
  id: string;
  name: string | null;
  email: string;
  device: string | null;
  lastSeenAt: Date;
  /** true — если это текущая сессия (сравнение по хэшу токена) */
  isCurrent: boolean;
}

/**
 * Список администраторов онлайн.
 * Возвращает только безопасные поля — без хэшей, токенов и паролей.
 */
export async function listOnlineAdmins(
  currentSessionToken?: string | null
): Promise<OnlineAdmin[]> {
  const rows = await prisma.adminActivity.findMany({
    where: { lastSeenAt: { gte: onlineCutoff() } },
    include: { admin: { select: { id: true, name: true, email: true } } },
    orderBy: { lastSeenAt: "desc" },
  });
  const currentKey = currentSessionToken
    ? hashSessionToken(currentSessionToken)
    : null;
  return rows.map((r) => ({
    id: r.admin.id,
    name: r.admin.name,
    email: r.admin.email,
    device: r.userAgent,
    lastSeenAt: r.lastSeenAt,
    isCurrent: currentKey !== null && r.sessionKey === currentKey,
  }));
}

/**
 * Периодическая уборка записей старше 24 часов.
 * Без cron: вызывается при heartbeat, но не чаще раза в 10 минут.
 */
let lastCleanupAt = 0;

async function maybeCleanup(): Promise<void> {
  const now = Date.now();
  if (now - lastCleanupAt < 10 * 60 * 1000) return;
  lastCleanupAt = now;
  const threshold = new Date(now - 24 * 60 * 60 * 1000);
  await Promise.all([
    prisma.visitorActivity.deleteMany({ where: { lastSeenAt: { lt: threshold } } }),
    prisma.adminActivity.deleteMany({ where: { lastSeenAt: { lt: threshold } } }),
  ]).catch(() => {});
}
