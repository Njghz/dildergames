import { NextResponse } from "next/server";
import { destroySession, SESSION_COOKIE } from "@/lib/auth";
import { removeAdminActivity } from "@/lib/presence";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST() {
  // Снимаем сессию с онлайна перед удалением cookie
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await removeAdminActivity(token).catch(() => {});
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
