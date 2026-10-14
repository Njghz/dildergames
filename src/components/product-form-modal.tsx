"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { productSchema } from "@/lib/validation";

interface Game {
  id: string;
  title: string;
}

interface Category {
  id: string;
  name: string;
  gameId: string;
}

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
}

interface Props {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductFormModal({ product, onClose, onSaved }: Props) {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [oldPrice, setOldPrice] = useState(
    product?.oldPrice ? String(product.oldPrice) : ""
  );
  const [stock, setStock] = useState(
    product ? String(product.stock) : "10"
  );
  const [gameId, setGameId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPopular, setIsPopular] = useState(product?.isPopular ?? false);
  const [isHidden, setIsHidden] = useState(product?.isHidden ?? false);
  const [isTest, setIsTest] = useState(product?.isTest ?? false);
  const [image, setImage] = useState<string | null>(product?.image ?? null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем игры и категории
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/games").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([g, c]) => {
        setGames(g.games ?? []);
        setCategories(c.categories ?? []);
        if (product) {
          // Для редактируемого товара подставим id через поиск по названиям
          // (в реальном API вернули бы их сразу — здесь упрощение через загрузку)
        }
      })
      .catch(() => setError("Ошибка загрузки справочников"));
  }, [product]);

  // Для редактирования подгружаем полные данные товара
  useEffect(() => {
    if (!product) return;
    fetch(`/api/admin/products`)
      .then((r) => r.json())
      .then((data) => {
        const full: Product | undefined = data.products?.find(
          (p: Product) => p.id === product.id
        );
        if (full) {
          setGameId((full as unknown as { gameId: string }).gameId ?? "");
          setCategoryId(
            (full as unknown as { categoryId: string }).categoryId ?? ""
          );
        }
      })
      .catch(() => {});
  }, [product]);

  // Фильтруем категории по выбранной игре
  const gameCategories = categories.filter((c) => c.gameId === gameId);

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

    const parsed = productSchema.safeParse({
      title,
      description,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      stock: Number(stock),
      gameId,
      categoryId,
      isPopular,
      isHidden,
      isTest,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Некорректные данные");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PATCH" : "POST",
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
        className="card my-8 w-full max-w-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {product ? "Редактировать товар" : "Новый товар"}
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
          {/* Изображение */}
          <div>
            <span className="label">Изображение</span>
            <div className="flex items-start gap-4">
              <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-nexus-600 bg-nexus-800">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt="Превью"
                    className="h-full w-full object-cover"
                  />
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
          </div>

          {/* Название */}
          <div>
            <label htmlFor="pf-title" className="label">
              Название <span className="text-red-400">*</span>
            </label>
            <input
              id="pf-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={120}
              placeholder="Например: Аккаунт Minecraft с лицензией"
              className="input"
            />
          </div>

          {/* Описание */}
          <div>
            <label htmlFor="pf-desc" className="label">Описание</label>
            <textarea
              id="pf-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="Подробное описание товара: что входит, особенности, ограничения"
              className="input resize-none"
            />
          </div>

          {/* Игра и категория */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-game" className="label">
                Игра <span className="text-red-400">*</span>
              </label>
              <select
                id="pf-game"
                value={gameId}
                onChange={(e) => {
                  setGameId(e.target.value);
                  setCategoryId("");
                }}
                required
                className="input"
              >
                <option value="">Выберите игру</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pf-cat" className="label">
                Категория <span className="text-red-400">*</span>
              </label>
              <select
                id="pf-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={!gameId}
                className="input disabled:opacity-50"
              >
                <option value="">
                  {gameId ? "Выберите категорию" : "Сначала выберите игру"}
                </option>
                {gameCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Цена, старая цена, остаток */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="pf-price" className="label">
                Цена, ₽ <span className="text-red-400">*</span>
              </label>
              <input
                id="pf-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={1}
                placeholder="990"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="pf-old" className="label">Старая цена, ₽</label>
              <input
                id="pf-old"
                type="number"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                min={1}
                placeholder="1490"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="pf-stock" className="label">
                Остаток <span className="text-red-400">*</span>
              </label>
              <input
                id="pf-stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                min={0}
                className="input"
              />
            </div>
          </div>

          {/* Флаги */}
          <div className="flex flex-wrap gap-5">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="h-4 w-4 rounded border-nexus-600 bg-nexus-800 accent-violet-500"
              />
              Популярный
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={isHidden}
                onChange={(e) => setIsHidden(e.target.checked)}
                className="h-4 w-4 rounded border-nexus-600 bg-nexus-800 accent-violet-500"
              />
              Скрыть из каталога
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-300" title="Демонстрационный товар">
              <input
                type="checkbox"
                checked={isTest}
                onChange={(e) => setIsTest(e.target.checked)}
                className="h-4 w-4 rounded border-nexus-600 bg-nexus-800 accent-amber-500"
              />
              Тестовый
            </label>
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
              {saving ? "Сохраняем…" : product ? "Сохранить изменения" : "Создать товар"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
