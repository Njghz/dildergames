import Link from "next/link";
import { prisma } from "@/lib/db";
import { GameCard } from "@/components/game-card";
import { ProductCard } from "@/components/product-card";
import { HeroSearch } from "@/components/hero-search";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [popularGames, popularProducts, latestProducts, totalGames] =
    await Promise.all([
      prisma.game.findMany({
        where: { isPopular: true },
        include: {
          _count: {
            select: { products: { where: { isHidden: false } } },
          },
        },
        orderBy: { sortOrder: "asc" },
        take: 8,
      }),
      prisma.product.findMany({
        where: { isHidden: false, isPopular: true, stock: { gt: 0 } },
        include: {
          game: { select: { title: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.product.findMany({
        where: { isHidden: false, stock: { gt: 0 } },
        include: {
          game: { select: { title: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.game.count(),
    ]);

  return (
    <div>
      {/* ===== Герой ===== */}
      <section className="hero-glow relative overflow-hidden">
        <div className="container-nexus py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Официальная площадка владельца
            </div>
            <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl animate-slide-up">
              Игровые товары{" "}
              <span className="gradient-text">напрямую от владельца</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-base text-slate-400 sm:text-lg animate-slide-up">
              Аккаунты, валюта, предметы и услуги для любимых игр. Без сторонних
              продавцов — только проверенные товары администратора площадки.
            </p>
            <HeroSearch />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-violet-400" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {totalGames} игр в каталоге
              </span>
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-violet-400" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Моментальная доставка
              </span>
              <span className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-violet-400" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Поддержка в Telegram
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Популярные игры ===== */}
      {popularGames.length > 0 && (
        <section className="container-nexus py-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Популярные игры
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Самые востребованные категории каталога
              </p>
            </div>
            <Link
              href="/catalog"
              className="hidden shrink-0 text-sm font-medium text-violet-400 transition-colors hover:text-violet-300 sm:block"
            >
              Весь каталог →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          <Link
            href="/catalog"
            className="btn-secondary mt-6 w-full sm:hidden"
          >
            Смотреть весь каталог
          </Link>
        </section>
      )}

      {/* ===== Популярные товары ===== */}
      {popularProducts.length > 0 && (
        <section id="popular-products" className="container-nexus py-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Популярные товары
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Чаще всего покупают прямо сейчас
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ===== Последние поступления ===== */}
      <section id="latest" className="container-nexus py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Последние поступления
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Новинки каталога от администратора
          </p>
        </div>
        {latestProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="card px-6 py-12 text-center text-slate-400">
            Каталог пока пуст. Скоро здесь появятся товары.
          </div>
        )}
      </section>

      {/* ===== Как это работает ===== */}
      <section className="container-nexus py-12">
        <div className="card relative overflow-hidden p-8 sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-blue-600/10" />
          <div className="relative">
            <h2 className="mb-8 text-center text-2xl font-bold text-white sm:text-3xl">
              Как купить товар
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Выберите товар",
                  text: "Откройте карточку товара, проверьте описание, цену и наличие.",
                },
                {
                  step: "02",
                  title: "Оформите заказ",
                  text: "Нажмите «Купить», укажите Telegram или e-mail для связи.",
                },
                {
                  step: "03",
                  title: "Получите товар",
                  text: "Владелец площадки свяжется с вами и передаст товар после оплаты.",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="rounded-2xl border border-nexus-600/60 bg-nexus-900/60 p-6"
                >
                  <span className="gradient-text mb-3 block text-3xl font-black">
                    {s.step}
                  </span>
                  <h3 className="mb-2 font-semibold text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
