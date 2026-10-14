"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ProductFormModal } from "@/components/product-form-modal";
import { DeleteConfirmModal } from "@/components/delete-confirm-modal";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  isPopular: boolean;
  isHidden: boolean;
  isTest: boolean;
  image: string | null;
  game: { title: string };
  category: { name: string };
  _count?: { orders: number };
}

const filters = [
  { key: "", label: "Все" },
  { key: "visible", label: "Видимые" },
  { key: "hidden", label: "Скрытые" },
  { key: "out", label: "Нет в наличии" },
  { key: "test", label: "Тестовые" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const load = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/products${status ? `?status=${status}` : ""}`
      );
      if (!res.ok) throw new Error("Ошибка загрузки");
      const data = await res.json();
      setProducts(data.products);
    } catch {
      setError("Не удалось загрузить товары");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter || undefined);
  }, [filter, load]);

  async function handleDelete() {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/admin/products/${deleting.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Ошибка удаления");
        return;
      }
      setProducts((list) => list.filter((p) => p.id !== deleting.id));
      setDeleting(null);
    } catch {
      alert("Ошибка сети");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Товары</h1>
          <p className="mt-1 text-sm text-slate-500">
            Управление товарами каталога
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          + Добавить товар
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-violet-500/20 text-violet-300 ring-1 ring-inset ring-violet-500/40"
                : "bg-nexus-800 text-slate-400 hover:bg-nexus-700 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Таблица */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
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
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Товаров нет. Нажмите «Добавить товар», чтобы создать первый.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-nexus-700/50 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5 font-medium">Товар</th>
                  <th className="px-4 py-3.5 font-medium">Игра</th>
                  <th className="px-4 py-3.5 font-medium">Цена</th>
                  <th className="px-4 py-3.5 font-medium">Остаток</th>
                  <th className="px-4 py-3.5 font-medium">Флаги</th>
                  <th className="px-4 py-3.5 text-right font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-700/40">
                {products.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-nexus-800/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image}
                            alt=""
                            className="h-10 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-nexus-700 text-xs text-slate-500">
                            —
                          </span>
                        )}
                        <span className="max-w-[220px] truncate font-medium text-slate-200">
                          {p.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{p.game.title}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-white">
                        {formatPrice(p.price)}
                      </span>
                      {p.oldPrice && p.oldPrice > p.price && (
                        <span className="ml-2 text-xs text-slate-500 line-through">
                          {formatPrice(p.oldPrice)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.stock === 0
                            ? "text-red-300"
                            : p.stock <= 3
                              ? "text-amber-300"
                              : "text-emerald-300"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {p.isPopular && <span className="badge-violet">Популярный</span>}
                        {p.isTest && <span className="badge-amber">Тест</span>}
                        {p.isHidden && <span className="badge-gray">Скрыт</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/product/${p.id}`}
                          className="btn-ghost px-2.5 py-1.5 text-xs"
                          target="_blank"
                        >
                          Открыть
                        </Link>
                        <button
                          onClick={() => {
                            setEditing(p);
                            setModalOpen(true);
                          }}
                          className="btn-ghost px-2.5 py-1.5 text-xs"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => setDeleting(p)}
                          className="btn-ghost px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <ProductFormModal
          product={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load(filter || undefined);
          }}
        />
      )}

      {deleting && (
        <DeleteConfirmModal
          title={deleting.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
