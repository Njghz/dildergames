import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { GameCard } from "@/components/game-card";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Поиск",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  if (query.length < 2) {
    return (
      <div className="container-nexus py-16">
        <EmptyState
          title="Введите запрос"
          description="Укажите название игры или товара (минимум 2 символа)."
        />
      </div>
    );
  }

  const [games, products] = await Promise.all([
    prisma.game.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        _count: {
          select: { products: { where: { isHidden: false } } },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: {
        isHidden: false,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { game: { title: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        game: { select: { title: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const isEmpty = games.length === 0 && products.length === 0;

  return (
    <div className="container-nexus py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Результаты поиска: «{query}»
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isEmpty
            ? "Ничего не найдено"
            : `Найдено: ${games.length} ${games.length === 1 ? "игра" : "игр"}, ${products.length} ${products.length === 1 ? "товар" : "товаров"}`}
        </p>
      </div>

      {isEmpty ? (
        <EmptyState
          title="Ничего не найдено"
          description="Попробуйте изменить запрос или посмотрите весь каталог игр."
          actionHref="/catalog"
          actionLabel="Открыть каталог"
        />
      ) : (
        <div className="space-y-12">
          {games.length > 0 && (
            <section>
              <h2 className="mb-5 text-xl font-bold text-white">Игры</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </section>
          )}
          {products.length > 0 && (
            <section>
              <h2 className="mb-5 text-xl font-bold text-white">Товары</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/catalog" className="btn-secondary">
          Смотреть весь каталог
        </Link>
      </div>
    </div>
  );
}
