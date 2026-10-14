import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/admin/products — список всех товаров (включая скрытые) */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status");

  const products = await prisma.product.findMany({
    where: {
      ...(status === "hidden" ? { isHidden: true } : {}),
      ...(status === "visible" ? { isHidden: false } : {}),
      ...(status === "out" ? { stock: 0 } : {}),
      ...(status === "test" ? { isTest: true } : {}),
    },
    include: {
      game: { select: { title: true } },
      category: { select: { name: true } },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

/** POST /api/admin/products — создание товара */
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

  // image передаётся отдельным полем и не входит в productSchema
  const { image, ...restBody } = body as Record<string, unknown> & { image?: string };

  const parsed = productSchema.safeParse(restBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Проверяем, что игра и категория существуют и связаны
  const category = await prisma.category.findFirst({
    where: { id: data.categoryId, gameId: data.gameId },
  });
  if (!category) {
    return NextResponse.json(
      { error: "Категория не принадлежит выбранной игре" },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      oldPrice: data.oldPrice ?? null,
      stock: data.stock,
      gameId: data.gameId,
      categoryId: data.categoryId,
      isPopular: data.isPopular,
      isHidden: data.isHidden,
      isTest: data.isTest,
      image: image ?? null,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
