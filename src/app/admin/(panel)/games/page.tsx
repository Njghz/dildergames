"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GameFormModal } from "@/components/game-form-modal";
import { DeleteConfirmModal } from "@/components/delete-confirm-modal";

interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  isPopular: boolean;
  sortOrder: number;
  _count?: { products: number; categories: number };
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [deleting, setDeleting] = useState<Game | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/games");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGames(data.games);
    } catch {
      setError("Не удалось загрузить игры");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/admin/games/${deleting.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Ошибка удаления");
        return;
      }
      setGames((list) => list.filter((g) => g.id !== deleting.id));
      setDeleting(null);
    } catch {
      alert("Ошибка сети");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Игры</h1>
          <p className="mt-1 text-sm text-slate-500">
            Категории каталога маркетплейса
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          + Добавить игру
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-16" />
            ))}
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="mb-4 text-red-300">{error}</p>
            <button onClick={load} className="btn-secondary">Повторить</button>
          </div>
        ) : games.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Игр нет. Создайте первую игру каталога.
          </div>
        ) : (
          <div className="divide-y divide-nexus-700/40">
            {games.map((g) => (
              <div key={g.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                {g.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.image}
                    alt=""
                    className="h-12 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-16 items-center justify-center rounded-lg bg-nexus-700 text-sm font-bold text-slate-400">
                    {g.title.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/game/${g.slug}`}
                      className="font-semibold text-slate-200 transition-colors hover:text-violet-300"
                      target="_blank"
                    >
                      {g.title}
                    </Link>
                    {g.isPopular && <span className="badge-violet">Популярная</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    /game/{g.slug} · товаров: {g._count?.products ?? 0} · категорий:{" "}
                    {g._count?.categories ?? 0}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setEditing(g);
                      setModalOpen(true);
                    }}
                    className="btn-ghost px-2.5 py-1.5 text-xs"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => setDeleting(g)}
                    className="btn-ghost px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <GameFormModal
          game={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            load();
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
