import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=...
 * Поиск игр и товаров без учёта регистра.
 * Возвращает только видимые (не скрытые) товары администратора.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ games: [], products: [] });
  }

  const like = `%${q.replace(/[%_]/g, "")}%`;

  const [games, products] = await Promise.all([
    prisma.game.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { slug: true, title: true, image: true },
      take: 5,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: {
        isHidden: false,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { game: { title: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        title: true,
        price: true,
        game: { select: { title: true } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ games, products });
}
