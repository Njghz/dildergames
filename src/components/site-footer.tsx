import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-nexus-700/50 bg-nexus-900/60">
      <div className="container-nexus grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
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
            <span className="text-lg font-extrabold text-white">
              Dilder<span className="gradient-text">Games</span>
            </span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            Закрытый маркетплейс цифровых игровых товаров. Все товары
            выставляются владельцем площадки — без сторонних продавцов и
            посредников.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
            Покупателям
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <Link href="/catalog" className="transition-colors hover:text-violet-300">
                Каталог игр
              </Link>
            </li>
            <li>
              <Link href="/#popular-products" className="transition-colors hover:text-violet-300">
                Популярные товары
              </Link>
            </li>
            <li>
              <Link href="/#latest" className="transition-colors hover:text-violet-300">
                Новые поступления
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
            Информация
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <Link href="/rules" className="transition-colors hover:text-violet-300">
                Правила площадки
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="transition-colors hover:text-violet-300">
                Контакты
              </Link>
            </li>
            <li>
              <Link href="/delivery" className="transition-colors hover:text-violet-300">
                Как получить товар
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-nexus-700/40 py-5">
        <div className="container-nexus flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} DilderGames. Все права защищены.</p>
          <p>Демонстрационный проект. Товары и игры принадлежат их правообладателям.</p>
        </div>
      </div>
    </footer>
  );
}
