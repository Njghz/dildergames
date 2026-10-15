import { NextRequest, NextResponse } from "next/server";
import { passwordSchema } from "@/lib/validation";
import { verifyAdminPassword, createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Лимит попыток входа (защита от перебора) */
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || rec.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (rec.count >= MAX_ATTEMPTS) return false;
  rec.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Слишком много попыток. Попробуйте через 15 минут." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный формат запроса" }, { status: 400 });
  }

  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const { password } = parsed.data;

  // Пароль проверяется на сервере против ADD_PASSWORD (timing-safe).
  // При несовпадении всегда возвращаем одинаковый ответ и статус.
  if (!verifyAdminPassword(password)) {
    return NextResponse.json(
      { error: "Неверный пароль" },
      { status: 401 }
    );
  }

  await createSession();

  // В ответ не отправляется ни пароль, ни токен — только httpOnly cookie.
  return NextResponse.json({ ok: true });
}
