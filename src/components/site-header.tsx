"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchSuggestions } from "@/components/search-suggestions";

export function SiteHeader() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setFocused(false);
    setMobileOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-nexus-700/50 bg-nexus-950/80 backdrop-blur-xl">
      <div className="container-nexus flex h-16 items-center gap-4">
        {/* Логотип */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-900/50">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              <path
                d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M12 22V12M12 12l9-5M12 12L3 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Dilder<span className="gradient-text">Games</span>
          </span>
        </Link>

        {/* Поиск (десктоп) */}
        <div ref={boxRef} className="relative mx-auto hidden w-full max-w-xl md:block">
          <form onSubmit={submitSearch}>
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                width="20"
                height="20"
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                placeholder="Найти игру или товар"
                className="input pl-11 pr-4"
                aria-label="Поиск игр и товаров"
              />
            </div>
          </form>
          {focused && query.trim().length >= 2 && (
            <SearchSuggestions
              query={query.trim()}
              onSelect={() => setFocused(false)}
            />
          )}
        </div>

        {/* Навигация */}
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Link href="/catalog" className="btn-ghost">
            Каталог
          </Link>
          <Link href="/catalog" className="btn-ghost">
            Игры
          </Link>
          <Link href="/#popular-products" className="btn-ghost">
            Товары
          </Link>
        </nav>

        {/* Мобильная кнопка поиска */}
        <button
          className="btn-ghost ml-auto md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Меню"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Мобильная панель */}
      {mobileOpen && (
        <div className="border-t border-nexus-700/50 bg-nexus-900 px-4 py-3 md:hidden">
          <form onSubmit={submitSearch} className="relative mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти игру или товар"
              className="input"
              aria-label="Поиск игр и товаров"
            />
          </form>
          <div className="flex flex-col gap-1">
            <Link
              href="/catalog"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-nexus-800"
            >
              Каталог игр
            </Link>
            <Link
              href="/#popular-products"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-nexus-800"
            >
              Популярные товары
            </Link>
            <Link
              href="/#latest"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-nexus-800"
            >
              Новые поступления
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
