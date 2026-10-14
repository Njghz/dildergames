"use client";

import { useEffect, useState } from "react";
import { categorySchema } from "@/lib/validation";

interface Game {
  id: string;
  title: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  gameId: string;
  sortOrder: number;
}

interface Props {
  category: Category | null;
  defaultGameId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function CategoryFormModal({
  category,
  defaultGameId,
  onClose,
  onSaved,
}: Props) {
  const [games, setGames] = useState<Game[]>([]);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [gameId, setGameId] = useState(category?.gameId ?? defaultGameId ?? "");
  const [sortOrder, setSortOrder] = useState(
    category ? String(category.sortOrder) : "0"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/games")
      .then((r) => r.json())
      .then((data) => setGames(data.games ?? []))
      .catch(() => setError("Ошибка загрузки игр"));
  }, []);

  function generateSlug() {
    setSlug(
      name
        .toLowerCase()
        .replace(/[а-яё]/g, (ch) => {
          const map: Record<string, string> = {
            а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
            ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
            н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
            ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
            ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
          };
          return map[ch] ?? ch;
        })
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const parsed = categorySchema.safeParse({
      name,
      slug,
      gameId,
      sortOrder: Number(sortOrder),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Некорректные данные");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(
        category ? `/api/admin/categories/${category.id}` : "/api/admin/categories",
        {
          method: category ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка сохранения");
        return;
      }
      onSaved();
    } catch {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-nexus-950/80 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card my-8 w-full max-w-lg p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {category ? "Редактировать категорию" : "Новая категория"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 transition-colors hover:text-slate-300"
            aria-label="Закрыть"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="cf-game" className="label">
              Игра <span className="text-red-400">*</span>
            </label>
            <select
              id="cf-game"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              required
              className="input"
              disabled={Boolean(category)}
            >
              <option value="">Выберите игру</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
            {category && (
              <p className="mt-1 text-xs text-slate-500">
                Игру можно изменить только при создании новой категории
              </p>
            )}
          </div>

          <div>
            <label htmlFor="cf-name" className="label">
              Название <span className="text-red-400">*</span>
            </label>
            <input
              id="cf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={60}
              onBlur={() => {
                if (!slug && name) generateSlug();
              }}
              placeholder="Например: Аккаунты"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="cf-slug" className="label">
              URL (slug) <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="cf-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                minLength={2}
                maxLength={60}
                pattern="[a-z0-9-]+"
                placeholder="accounts"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="btn-secondary shrink-0 text-xs"
              >
                Сгенерировать
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="cf-order" className="label">Порядок сортировки</label>
            <input
              id="cf-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              min={0}
              className="input"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Сохраняем…" : category ? "Сохранить изменения" : "Создать категорию"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
