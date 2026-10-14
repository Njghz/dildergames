import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  VISITOR_COOKIE,
  VISITOR_COOKIE_MAX_AGE,
  isValidVisitorToken,
  newVisitorToken,
  removeVisitor,
  touchVisitor,
} from "@/lib/presence";

export const dynamic = "force-dynamic";

/**
 * Heartbeat посетителя (публичный).
 * - При action:"online" (по умолчанию) обновляет время активности по cookie.
 * - При action:"offline" снимает посетителя с онлайна (закрытие вкладки).
 * Не раскрывает никаких данных — возвращает только { ok: true }.
 */
export async function POST(req: NextRequest) {
  let action: "online" | "offline" = "online";
  try {
    const body = await req.json();
    if (body?.action === "offline") action = "offline";
  } catch {
    // пустое тело — считаем обычным online-heartbeat
  }

  const store = await cookies();
  let token = store.get(VISITOR_COOKIE)?.value ?? "";
  if (!isValidVisitorToken(token)) {
    token = newVisitorToken();
  }

  if (action === "offline") {
    await removeVisitor(token);
    return NextResponse.json({ ok: true });
  }

  await touchVisitor(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(VISITOR_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_COOKIE_MAX_AGE,
  });
  return res;
}
