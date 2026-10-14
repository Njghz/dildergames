"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SuggestionGame {
  slug: string;
  title: string;
  image: string | null;
}

interface SuggestionProduct {
  id: string;
  title: string;
  price: number;
  gameTitle: string;
}

export function SearchSuggestions({
  query,
  onSelect,
}: {
  query: string;
  onSelect: () => void;
}) {
  const router = useRouter();
  const [games, setGames] = useState<SuggestionGame[]>([]);
  const [products, setProducts] = useState<SuggestionProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setGames(data.games ?? []);
          setProducts(data.products ?? []);
        }
      } catch {
        /* игнорируем прерванные запросы */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [query]);

  const hasResults = games.length > 0 || products.length > 0;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-nexus-600 bg-nexus-850 shadow-2xl shadow-black/50 animate-fade-in">
      {loading ? (
        <div className="space-y-2 p-3">
          <div className="skeleton h-10" />
          <div className="skeleton h-10" />
        </div>
      ) : !hasResults ? (
        <div className="p-4 text-sm text-slate-400">
          По запросу «{query}» ничего не найдено
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto p-2">
          {games.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Игры
              </p>
              {games.map((g) => (
                <button
                  key={g.slug}
                  onClick={() => {
                    onSelect();
                    router.push(`/game/${g.slug}`);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-nexus-700/60"
                >
                  {g.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.image}
                      alt=""
                      className="h-9 w-9 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-nexus-700 text-xs font-bold text-slate-400">
                      {g.title.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm font-medium text-slate-200">{g.title}</span>
                </button>
              ))}
            </>
          )}
          {products.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Товары
              </p>
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelect();
                    router.push(`/product/${p.id}`);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-nexus-700/60"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-200">
                      {p.title}
                    </span>
                    <span className="block text-xs text-slate-500">{p.gameTitle}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-violet-300">
                    {new Intl.NumberFormat("ru-RU").format(p.price)} ₽
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
