import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/admin/categories — все категории (сгруппированы по играм) */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    include: {
      game: { select: { title: true } },
      _count: { select: { products: true } },
    },
    orderBy: [{ gameId: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json({ categories });
}

/** POST /api/admin/categories — создание категории */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный формат запроса" }, { status: 400 });
  }

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const game = await prisma.game.findUnique({
    where: { id: parsed.data.gameId },
  });
  if (!game) {
    return NextResponse.json({ error: "Игра не найдена" }, { status: 404 });
  }

  const slugTaken = await prisma.category.findFirst({
    where: { slug: parsed.data.slug, gameId: parsed.data.gameId },
  });
  if (slugTaken) {
    return NextResponse.json(
      { error: "Такая категория уже существует в этой игре" },
      { status: 409 }
    );
  }

  const category = await prisma.category.create({ data: parsed.data });
  return NextResponse.json({ category }, { status: 201 });
}
