"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CategoryFormModal } from "@/components/category-form-modal";
import { DeleteConfirmModal } from "@/components/delete-confirm-modal";

interface Category {
  id: string;
  name: string;
  slug: string;
  gameId: string;
  sortOrder: number;
  game: { title: string };
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameFilter, setGameFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [defaultGameId, setDefaultGameId] = useState("");
  const [deleting, setDeleting] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data.categories);
    } catch {
      setError("Не удалось загрузить категории");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Уникальные игры для фильтра
  const gameNames = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.gameId, c.game.title));
    return Array.from(map.entries());
  }, [categories]);

  const filtered = gameFilter
    ? categories.filter((c) => c.gameId === gameFilter)
    : categories;

  async function handleDelete() {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/admin/categories/${deleting.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Ошибка удаления");
        return;
      }
      setCategories((list) => list.filter((c) => c.id !== deleting.id));
      setDeleting(null);
    } catch {
      alert("Ошибка сети");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Категории</h1>
          <p className="mt-1 text-sm text-slate-500">
            Категории товаров внутри игр
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setDefaultGameId(gameFilter);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          + Добавить категорию
        </button>
      </div>

      {gameNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setGameFilter("")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              !gameFilter
                ? "bg-violet-500/20 text-violet-300 ring-1 ring-inset ring-violet-500/40"
                : "bg-nexus-800 text-slate-400 hover:bg-nexus-700 hover:text-white"
            }`}
          >
            Все игры
          </button>
          {gameNames.map(([id, title]) => (
            <button
              key={id}
              onClick={() => setGameFilter(id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                gameFilter === id
                  ? "bg-violet-500/20 text-violet-300 ring-1 ring-inset ring-violet-500/40"
                  : "bg-nexus-800 text-slate-400 hover:bg-nexus-700 hover:text-white"
              }`}
            >
              {title}
            </button>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-12" />
            ))}
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="mb-4 text-red-300">{error}</p>
            <button onClick={load} className="btn-secondary">Повторить</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Категорий нет. Создайте первую категорию внутри игры.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-nexus-700/50 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5 font-medium">Категория</th>
                  <th className="px-4 py-3.5 font-medium">Игра</th>
                  <th className="px-4 py-3.5 font-medium">Товаров</th>
                  <th className="px-4 py-3.5 font-medium">Порядок</th>
                  <th className="px-4 py-3.5 text-right font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-700/40">
                {filtered.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-nexus-800/40">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-200">{c.name}</div>
                      <div className="text-xs text-slate-500">/{c.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{c.game.title}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {c._count?.products ?? 0}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{c.sortOrder}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditing(c);
                            setModalOpen(true);
                          }}
                          className="btn-ghost px-2.5 py-1.5 text-xs"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => setDeleting(c)}
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
        <CategoryFormModal
          category={editing}
          defaultGameId={defaultGameId}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}

      {deleting && (
        <DeleteConfirmModal
          title={deleting.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
