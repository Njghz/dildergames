import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { requireAdmin, SESSION_COOKIE } from "@/lib/auth";
import { countOnlineVisitors, listOnlineAdmins } from "@/lib/presence";
import { formatPrice, formatDateTime, formatTimeAgo } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { OnlineRefresh } from "@/components/online-refresh";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await requireAdmin();
  if (!session) return null; // layout уже сделал redirect

  const store = await cookies();
  const rawToken = store.get(SESSION_COOKIE)?.value ?? null;

  const [
    onlineVisitors,
    onlineAdmins,
    productsCount,
    gamesCount,
    ordersCount,
    ordersNew,
    outOfStock,
    revenueAgg,
    recentOrders,
  ] = await Promise.all([
    countOnlineVisitors(),
    listOnlineAdmins(rawToken),
    prisma.product.count(),
    prisma.game.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const cards = [
    {
      label: "Посетители онлайн",
      value: String(onlineVisitors),
      accent: "text-emerald-300",
    },
    {
      label: "Администраторы онлайн",
      value: String(onlineAdmins.length),
      accent: "text-violet-300",
    },
    {
      label: "Товаров",
      value: String(productsCount),
      href: "/admin/products",
      accent: "text-white",
    },
    {
      label: "Игр",
      value: String(gamesCount),
      href: "/admin/games",
      accent: "text-white",
    },
    {
      label: "Заказов",
      value: String(ordersCount),
      href: "/admin/orders",
      accent: "text-white",
    },
  ];

  return (
    <div className="space-y-6">
      <OnlineRefresh />

      <div>
        <h1 className="text-2xl font-bold text-white">Дашборд</h1>
        <p className="mt-1 text-sm text-slate-500">
          Сводка по маркетплейсу · {new Date().toLocaleDateString("ru-RU")}
        </p>
      </div>

      {/* Ключевые показатели */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => {
          const inner = (
            <>
              <p className="text-xs text-slate-500">{c.label}</p>
              <p className={`mt-1 text-2xl font-bold ${c.accent}`}>{c.value}</p>
            </>
          );
          return c.href ? (
            <Link
              key={c.label}
              href={c.href}
              className="card p-4 transition-colors hover:border-violet-500/40"
            >
              {inner}
            </Link>
          ) : (
            <div key={c.label} className="card p-4">
              {inner}
            </div>
          );
        })}
      </div>

      {/* Администраторы онлайн */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-nexus-700/50 px-5 py-3.5">
          <h2 className="font-semibold text-white">Администраторы онлайн</h2>
          <span className="text-xs text-slate-500">
            обновляется автоматически
          </span>
        </div>
        {onlineAdmins.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            Никто не в сети — откройте любую страницу админки, чтобы появиться
            здесь
          </div>
        ) : (
          <div className="divide-y divide-nexus-700/40">
            {onlineAdmins.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-300">
                  {(a.name || a.email).charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {a.name || a.email}
                    {a.isCurrent && (
                      <span className="ml-2 text-xs font-normal text-emerald-400">
                        (вы)
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-slate-500">{a.email}</p>
                </div>
                {a.device && (
                  <span className="max-w-48 truncate text-xs text-slate-500">
                    {a.device}
                  </span>
                )}
                <span className="w-28 text-right text-xs text-slate-500">
                  {formatTimeAgo(a.lastSeenAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Доп. статистика заказов */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs text-slate-500">Новые заказы</p>
          <p className="mt-1 text-xl font-bold text-violet-300">{ordersNew}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Выручка</p>
          <p className="mt-1 text-xl font-bold text-emerald-300">
            {formatPrice(revenueAgg._sum.total ?? 0)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Нет в наличии</p>
          <p
            className={`mt-1 text-xl font-bold ${
              outOfStock > 0 ? "text-amber-300" : "text-white"
            }`}
          >
            {outOfStock}
          </p>
        </div>
        <Link
          href="/admin/orders?status=NEW"
          className="card p-4 transition-colors hover:border-violet-500/40"
        >
          <p className="text-xs text-slate-500">К обработке</p>
          <p className="mt-1 text-xl font-bold text-blue-300">→</p>
        </Link>
      </div>

      {/* Последние заказы */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-nexus-700/50 px-5 py-4">
          <h2 className="font-semibold text-white">Последние заказы</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-violet-400 transition-colors hover:text-violet-300"
          >
            Все заказы →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Заказов пока нет
          </div>
        ) : (
          <div className="divide-y divide-nexus-700/40">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5"
              >
                <span className="font-mono text-sm font-semibold text-violet-300">
                  {order.number}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-300">
                  {order.items[0]?.title}
                  {order.items.length > 1 && ` +${order.items.length - 1}`}
                </span>
                <span className="text-sm font-medium text-white">
                  {formatPrice(order.total)}
                </span>
                <OrderStatusBadge status={order.status} />
                <span className="w-36 text-right text-xs text-slate-500">
                  {formatDateTime(order.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Быстрые действия */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/admin/products/new" className="card p-4 transition-colors hover:border-violet-500/40">
          <h3 className="font-semibold text-white">+ Добавить товар</h3>
          <p className="mt-1 text-sm text-slate-500">
            Новый товар в каталог
          </p>
        </Link>
        <Link href="/admin/games/new" className="card p-4 transition-colors hover:border-violet-500/40">
          <h3 className="font-semibold text-white">+ Добавить игру</h3>
          <p className="mt-1 text-sm text-slate-500">
            Новая категория каталога
          </p>
        </Link>
        <Link href="/admin/orders?status=NEW" className="card p-4 transition-colors hover:border-violet-500/40">
          <h3 className="font-semibold text-white">Обработать заказы</h3>
          <p className="mt-1 text-sm text-slate-500">
            Новые заказы ожидают ответа
          </p>
        </Link>
      </div>
    </div>
  );
}
