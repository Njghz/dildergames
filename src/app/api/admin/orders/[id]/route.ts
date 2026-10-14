import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const statusSchema = z.object({
  status: z.enum([
    "NEW",
    "AWAITING_PAYMENT",
    "PAID",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ]),
});

/** PATCH /api/admin/orders/[id] — изменение статуса заказа */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный формат запроса" }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }

  // При отмене заказа возвращаем товар в наличие (если заказ не был завершён)
  if (parsed.data.status === "CANCELLED" && order.status !== "CANCELLED") {
    await prisma.product.updateMany({
      where: { id: { in: order.items.map((i) => i.productId) } },
      data: { stock: { increment: 1 } },
    });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
    include: { items: true },
  });

  return NextResponse.json({ order: updated });
}
