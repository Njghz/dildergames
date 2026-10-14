import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { orderSchema } from "@/lib/validation";
import { formatOrderNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/orders
 * Создание заказа. Цена и наличие проверяются на сервере —
 * данные из тела запроса для расчёта не используются.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректный формат запроса" },
      { status: 400 }
    );
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const { productId, customerName, contact, comment } = parsed.data;

  // Проверяем товар на сервере: существование, видимость, наличие
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { game: { select: { title: true } } },
  });

  if (!product || product.isHidden) {
    return NextResponse.json(
      { error: "Товар не найден или снят с продажи" },
      { status: 404 }
    );
  }

  if (product.stock <= 0) {
    return NextResponse.json(
      { error: "Товар закончился. Оформление невозможно." },
      { status: 409 }
    );
  }

  // Генерируем номер заказа: максимальный существующий + 1
  const year = new Date().getFullYear();
  const prefix = `NX-${year}-`;
  const lastOrder = await prisma.order.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const seq = lastOrder
    ? parseInt(lastOrder.number.slice(prefix.length), 10) + 1
    : 1;
  const number = formatOrderNumber(seq);

  const order = await prisma.order.create({
    data: {
      number,
      customerName,
      contact,
      comment: comment || null,
      total: product.price,
      items: {
        create: {
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: 1,
        },
      },
      // Уменьшаем остаток атомарно, не уходя в минус
      // (через updateMany с условием stock > 0 для защиты от гонок)
    },
    include: { items: true },
  });

  // Атомарное уменьшение остатка с проверкой
  const decrement = await prisma.product.updateMany({
    where: { id: productId, stock: { gt: 0 } },
    data: { stock: { decrement: 1 } },
  });

  if (decrement.count === 0) {
    // Не удалось уменьшить остаток — отменяем заказ
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json(
      { error: "Товар только что закончился. Попробуйте позже." },
      { status: 409 }
    );
  }

  return NextResponse.json(
    {
      order: {
        id: order.id,
        number: order.number,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      },
    },
    { status: 201 }
  );
}
