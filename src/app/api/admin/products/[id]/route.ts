import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/products/[id] — обновление товара */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный формат запроса" }, { status: 400 });
  }

  // image передаётся отдельным полем и не входит в productSchema
  const { image: imageField, ...restBody } = body as Record<string, unknown> & { image?: string | null };

  const parsed = productSchema.partial().safeParse(restBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const image = typeof imageField === "string" ? imageField : null;

  // Если меняют игру/категорию — проверяем их связь
  if (data.gameId || data.categoryId) {
    const gameId = data.gameId ?? existing.gameId;
    const categoryId = data.categoryId ?? existing.categoryId;
    const category = await prisma.category.findFirst({
      where: { id: categoryId, gameId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Категория не принадлежит выбранной игре" },
        { status: 400 }
      );
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.oldPrice !== undefined && { oldPrice: data.oldPrice }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(image !== null && { image: image }),
      ...(data.gameId !== undefined && { gameId: data.gameId }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.isPopular !== undefined && { isPopular: data.isPopular }),
      ...(data.isHidden !== undefined && { isHidden: data.isHidden }),
      ...(data.isTest !== undefined && { isTest: data.isTest }),
    },
  });

  return NextResponse.json({ product });
}

/** DELETE /api/admin/products/[id] — удаление товара */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
