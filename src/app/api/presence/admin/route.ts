import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireAdmin, SESSION_COOKIE } from "@/lib/auth";
import { removeAdminActivity, touchAdminActivity } from "@/lib/presence";

export const dynamic = "force-dynamic";

/**
 * Heartbeat администратора (только для авторизованных администраторов).
 * - action:"online" (по умолчанию) обновляет время активности сессии.
 * - action:"offline" снимает сессию с онлайна (закрытие вкладки).
 * Без валидной сессии возвращает 401 — проверка выполняется на сервере.
 */
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  let action: "online" | "offline" = "online";
  try {
    const body = await req.json();
    if (body?.action === "offline") action = "offline";
  } catch {
    // пустое тело — online-heartbeat
  }

  // Токен сессии нужен только для вычисления хэша; в ответ он не попадает.
  const store = await cookies();
  const sessionToken = store.get(SESSION_COOKIE)?.value;

  if (action === "offline") {
    if (sessionToken) await removeAdminActivity(sessionToken);
    return NextResponse.json({ ok: true });
  }

  if (!sessionToken) {
    return NextResponse.json({ error: "Сессия не найдена" }, { status: 401 });
  }

  const userAgent = req.headers.get("user-agent");
  await touchAdminActivity(session.adminId, sessionToken, userAgent);

  return NextResponse.json({ ok: true });
}
