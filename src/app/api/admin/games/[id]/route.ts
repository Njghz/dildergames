import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { gameSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/games/[id] — обновление игры */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.game.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Игра не найдена" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный формат запроса" }, { status: 400 });
  }

  const parsed = gameSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  // Проверка уникальности slug при смене
  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const taken = await prisma.game.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (taken) {
      return NextResponse.json(
        { error: "Игра с таким slug уже существует" },
        { status: 409 }
      );
    }
  }

  const game = await prisma.game.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ game });
}

/** DELETE /api/admin/games/[id] — удаление игры (каскадно с товарами) */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.game.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Игра не найдена" }, { status: 404 });
  }

  // Prisma onDelete: Cascade удалит связанные товары и категории
  await prisma.game.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
