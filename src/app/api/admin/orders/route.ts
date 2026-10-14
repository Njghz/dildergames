import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/orders?status=NEW — список заказов */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

/** GET /api/admin/stats — сводная статистика для дашборда */
export async function POST() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  const [
    ordersTotal,
    ordersNew,
    ordersActive,
    ordersCompleted,
    revenue,
    productsCount,
    productsHidden,
    outOfStock,
    gamesCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.count({
      where: { status: { in: ["AWAITING_PAYMENT", "PAID", "IN_PROGRESS"] } },
    }),
    prisma.order.count({
      where: { status: { in: ["COMPLETED", "CANCELLED"] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.product.count(),
    prisma.product.count({ where: { isHidden: true } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.game.count(),
  ]);

  return NextResponse.json({
    stats: {
      ordersTotal,
      ordersNew,
      ordersActive,
      ordersCompleted,
      revenue: revenue._sum.total ?? 0,
      productsCount,
      productsHidden,
      outOfStock,
      gamesCount,
    },
  });
}
