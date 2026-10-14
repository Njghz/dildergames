import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/states";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = await prisma.game.findUnique({
    where: { slug },
    select: { title: true, description: true },
  });
  if (!game) return { title: "Игра не найдена" };
  return {
    title: game.title,
    description: game.description || `Товары для игры ${game.title} в маркетплейсе DilderGames`,
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;

  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: { products: { where: { isHidden: false } } },
          },
        },
      },
    },
  });

  if (!game) notFound();

  // Только видимые товары администратора
  const products = await prisma.product.findMany({
    where: { gameId: game.id, isHidden: false },
    include: {
      game: { select: { title: true } },
      category: { select: { name: true } },
    },
    orderBy: [{ isPopular: "desc" }, { createdAt: "desc" }],
  });

  const availableCount = products.filter((p) => p.stock > 0).length;

  return (
    <div>
      {/* Шапка игры */}
      <section className="relative overflow-hidden border-b border-nexus-700/50">
        {game.image && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={game.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-nexus-950/60 via-nexus-950/80 to-nexus-950" />
          </>
        )}
        <div className="container-nexus relative py-12">
          <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="transition-colors hover:text-violet-300">
              Главная
            </Link>
            <span>/</span>
            <Link href="/catalog" className="transition-colors hover:text-violet-300">
              Каталог
            </Link>
            <span>/</span>
            <span className="text-slate-300">{game.title}</span>
          </nav>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {game.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={game.image}
                alt={game.title}
                className="h-24 w-24 rounded-2xl border border-nexus-600 object-cover shadow-2xl"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                {game.title}
              </h1>
              {game.description && (
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  {game.description}
                </p>
              )}
              <p className="mt-3 text-sm text-slate-500">
                {products.length > 0 ? (
                  <>
                    {products.length}{" "}
                    {products.length === 1
                      ? "товар"
                      : products.length < 5
                        ? "товара"
                        : "товаров"}
                    {availableCount > 0 && ` · в наличии: ${availableCount}`}
                  </>
                ) : (
                  "Товары скоро появятся"
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Товары игры */}
      <section className="container-nexus py-10">
        {products.length === 0 ? (
          <EmptyState
            title="Пока нет товаров в этой категории"
            description="Администратор ещё не добавил товары для этой игры. Загляните позже или выберите другую игру из каталога."
            actionHref="/catalog"
            actionLabel="Перейти в каталог"
          />
        ) : (
          <>
            {game.categories.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {game.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="badge-gray"
                  >
                    {cat.name}
                    {cat._count.products > 0 && ` · ${cat._count.products}`}
                  </span>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
