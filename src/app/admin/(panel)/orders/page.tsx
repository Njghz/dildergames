"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { OrderStatusBadge, orderStatusLabel } from "@/components/order-status-badge";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  number: string;
  customerName: string;
  contact: string;
  comment: string | null;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

const statuses = [
  { key: "", label: "Все" },
  { key: "NEW", label: "Новые" },
  { key: "AWAITING_PAYMENT", label: "Ожидают оплаты" },
  { key: "PAID", label: "Оплаченные" },
  { key: "IN_PROGRESS", label: "В работе" },
  { key: "COMPLETED", label: "Завершённые" },
  { key: "CANCELLED", label: "Отменённые" },
];

const nextStatuses: Record<string, { key: string; label: string; className: string }[]> = {
  NEW: [
    { key: "AWAITING_PAYMENT", label: "В работу", className: "btn-primary" },
    { key: "CANCELLED", label: "Отменить", className: "btn-danger" },
  ],
  AWAITING_PAYMENT: [
    { key: "PAID", label: "Оплачен", className: "btn-primary" },
    { key: "CANCELLED", label: "Отменить", className: "btn-danger" },
  ],
  PAID: [
    { key: "IN_PROGRESS", label: "Выполняется", className: "btn-primary" },
    { key: "CANCELLED", label: "Отменить", className: "btn-danger" },
  ],
  IN_PROGRESS: [
    { key: "COMPLETED", label: "Завершить", className: "btn-primary" },
    { key: "CANCELLED", label: "Отменить", className: "btn-danger" },
  ],
  COMPLETED: [],
  CANCELLED: [],
};

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") ?? "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/orders${status ? `?status=${status}` : ""}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data.orders);
    } catch {
      setError("Не удалось загрузить заказы");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(statusFilter || undefined);
  }, [statusFilter, load]);

  async function changeStatus(orderId: string, status: string) {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Ошибка обновления");
        return;
      }
      // Обновляем локально
      setOrders((list) =>
        list.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch {
      alert("Ошибка сети");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Заказы</h1>
        <p className="mt-1 text-sm text-slate-500">
          Управление заказами покупателей
        </p>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === s.key
                ? "bg-violet-500/20 text-violet-300 ring-1 ring-inset ring-violet-500/40"
                : "bg-nexus-800 text-slate-400 hover:bg-nexus-700 hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-14" />
            ))}
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="mb-4 text-red-300">{error}</p>
            <button onClick={() => load()} className="btn-secondary">
              Повторить
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Заказов с таким статусом нет
          </div>
        ) : (
          <div className="divide-y divide-nexus-700/40">
            {orders.map((order) => {
              const isOpen = expanded === order.id;
              const actions = nextStatuses[order.status] ?? [];
              return (
                <div key={order.id}>
                  {/* Строка заказа */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                    <span className="font-mono text-sm font-bold text-violet-300">
                      {order.number}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">
                      {order.items.map((i) => i.title).join(", ")}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {formatPrice(order.total)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                    <span className="w-40 text-right text-xs text-slate-500">
                      {formatDateTime(new Date(order.createdAt))}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setExpanded(isOpen ? null : order.id)}
                        className="btn-ghost px-2.5 py-1.5 text-xs"
                      >
                        {isOpen ? "Скрыть" : "Детали"}
                      </button>
                      {actions.map((a) => (
                        <button
                          key={a.key}
                          onClick={() => changeStatus(order.id, a.key)}
                          disabled={updating === order.id}
                          className={`${a.className} px-3 py-1.5 text-xs`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Детали */}
                  {isOpen && (
                    <div className="mx-5 mb-4 rounded-xl border border-nexus-700/60 bg-nexus-800/60 p-5 animate-fade-in">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500">
                            Покупатель
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-200">
                            {order.customerName || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500">
                            Контакт
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-200">
                            {order.contact}
                          </p>
                        </div>
                      </div>

                      {order.items.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                            Состав заказа
                          </p>
                          <div className="space-y-1.5">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-slate-300">
                                  {item.title}
                                  {item.quantity > 1 && ` × ${item.quantity}`}
                                </span>
                                <span className="font-medium text-slate-200">
                                  {formatPrice(item.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {order.comment && (
                        <div className="mt-4">
                          <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                            Комментарий покупателя
                          </p>
                          <p className="whitespace-pre-line rounded-lg bg-nexus-900/60 p-3 text-sm text-slate-300">
                            {order.comment}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-xs text-slate-500">
                          Текущий статус: {orderStatusLabel(order.status)}
                        </span>
                        <div className="ml-auto flex gap-2">
                          {actions.map((a) => (
                            <button
                              key={a.key}
                              onClick={() => changeStatus(order.id, a.key)}
                              disabled={updating === order.id}
                              className={`${a.className} px-4 py-2 text-xs`}
                            >
                              {updating === order.id
                                ? "Обновляем…"
                                : `Перевести: ${orderStatusLabel(a.key)}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
