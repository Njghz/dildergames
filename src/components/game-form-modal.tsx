"use client";

import { useState } from "react";
import { gameSchema } from "@/lib/validation";

interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  isPopular: boolean;
  sortOrder: number;
}

interface Props {
  game: Game | null;
  onClose: () => void;
  onSaved: () => void;
}

export function GameFormModal({ game, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(game?.title ?? "");
  const [slug, setSlug] = useState(game?.slug ?? "");
  const [description, setDescription] = useState(game?.description ?? "");
  const [isPopular, setIsPopular] = useState(game?.isPopular ?? false);
  const [sortOrder, setSortOrder] = useState(
    game ? String(game.sortOrder) : "0"
  );
  const [image, setImage] = useState<string | null>(game?.image ?? null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    game?.image ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function generateSlug() {
    setSlug(
      title
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
        .slice(0, 80)
    );
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка загрузки файла");
        return;
      }
      setImage(data.url);
      setImagePreview(data.url);
    } catch {
      setError("Ошибка сети при загрузке");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const parsed = gameSchema.safeParse({
      title,
      slug,
      description,
      isPopular,
      sortOrder: Number(sortOrder),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Некорректные данные");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(
        game ? `/api/admin/games/${game.id}` : "/api/admin/games",
        {
          method: game ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...parsed.data, image }),
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
        className="card my-8 w-full max-w-xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {game ? "Редактировать игру" : "Новая игра"}
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
          <div className="flex items-start gap-4">
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-nexus-600 bg-nexus-800">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Превью" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                  Нет фото
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-nexus-950/60">
                  <svg className="h-5 w-5 animate-spin text-violet-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="btn-secondary cursor-pointer text-xs">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                />
                {uploading ? "Загрузка…" : image ? "Заменить" : "Загрузить"}
              </label>
              {image && (
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Удалить изображение
                </button>
              )}
              <p className="text-xs text-slate-500">JPG, PNG, WebP или GIF до 5 МБ</p>
            </div>
          </div>

          <div>
            <label htmlFor="gf-title" className="label">
              Название <span className="text-red-400">*</span>
            </label>
            <input
              id="gf-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={80}
              onBlur={() => {
                if (!slug && title) generateSlug();
              }}
              placeholder="Например: Minecraft"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="gf-slug" className="label">
              URL (slug) <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="gf-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                minLength={2}
                maxLength={80}
                pattern="[a-z0-9-]+"
                placeholder="minecraft"
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
            <label htmlFor="gf-desc" className="label">Описание</label>
            <textarea
              id="gf-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Краткое описание игры для страницы каталога"
              className="input resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gf-order" className="label">Порядок сортировки</label>
              <input
                id="gf-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                min={0}
                className="input"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="h-4 w-4 rounded border-nexus-600 bg-nexus-800 accent-violet-500"
                />
                Популярная игра
              </label>
            </div>
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
            <button type="submit" disabled={saving || uploading} className="btn-primary">
              {saving ? "Сохраняем…" : game ? "Сохранить изменения" : "Создать игру"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
