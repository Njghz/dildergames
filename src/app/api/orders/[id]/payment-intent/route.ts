import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/orders/[id]/payment-intent
 * Помечает заказ как ожидающий оплаты (NEW -> AWAITING_PAYMENT),
 * когда покупатель нажал «Оплатить».
 *
 * Ограничения безопасности:
 *  - разрешён только переход NEW -> AWAITING_PAYMENT;
 *  - заказ нельзя пометить оплаченным (PAID) через этот роут;
 *  - заказ не удаляется и не дублируется;
 *  - уже оплаченные/завершённые/отменённые заказы не изменяются (не даунгрейдим).
 * Нужен идентификатор заказа (cuid), который невозможно угадать.
 */
export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  // Меняем статус только из NEW. Всё остальное (PAID, COMPLETED,
  // CANCELLED, IN_PROGRESS, AWAITING_PAYMENT) не трогаем.
  if (order.status !== "NEW") {
    return NextResponse.json(
      { ok: true, status: order.status, changed: false },
      { status: 200 }
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "AWAITING_PAYMENT" },
    select: { id: true, number: true, status: true },
  });

  return NextResponse.json(
    { ok: true, status: updated.status, changed: true },
    { status: 200 }
  );
}
