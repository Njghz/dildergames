import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { gameSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/admin/games — список всех игр */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: { products: true, categories: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return NextResponse.json({ games });
}

/** POST /api/admin/games — создание игры */
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

  const parsed = gameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const slugTaken = await prisma.game.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (slugTaken) {
    return NextResponse.json(
      { error: "Игра с таким slug уже существует" },
      { status: 409 }
    );
  }

  const game = await prisma.game.create({ data: parsed.data });
  return NextResponse.json({ game }, { status: 201 });
}
