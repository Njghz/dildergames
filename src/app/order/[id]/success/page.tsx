import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { PayButton } from "@/components/pay-button";
import { OrderStatusBadge } from "@/components/order-status-badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Заказ оформлен",
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ number?: string }>;
}

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { number } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="container-nexus max-w-2xl py-16">
      <div className="card p-8 text-center sm:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
          <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-emerald-400" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
          Заказ оформлен!
        </h1>
        <p className="mb-8 text-slate-400">
          Номер вашего заказа:{" "}
          <span className="font-mono font-bold text-violet-300">
            {number ?? order.number}
          </span>
        </p>

        <div className="mb-8 space-y-3 rounded-2xl bg-nexus-800/80 p-6 text-left">
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-slate-500">Товар</span>
            <span className="text-right font-medium text-slate-200">
              {order.items[0]?.title}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-slate-500">Сумма</span>
            <span className="font-semibold text-white">
              {formatPrice(order.total)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-slate-500">Дата</span>
            <span className="text-slate-200">{formatDateTime(order.createdAt)}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span className="text-slate-500">Статус</span>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-left">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-300">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
            </svg>
            Онлайн-оплата пока не подключена
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Владелец площадки свяжется с вами по указанному контакту
            ({order.contact}) для уточнения деталей и предложит удобный способ
            оплаты. Нажмите «Оплатить заказ» ниже — откроется окно с
            инструкцией и нашим Telegram.
          </p>
        </div>

        <div className="mb-4">
          <PayButton
            orderNumber={order.number}
            orderId={order.id}
            label="Оплатить заказ"
            className="btn-primary w-full py-4 text-base"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/catalog" className="btn-primary flex-1">
            Продолжить покупки
          </Link>
          <Link href="/" className="btn-secondary flex-1">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
