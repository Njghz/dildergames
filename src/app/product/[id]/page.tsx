import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { StockBadge } from "@/components/stock-badge";
import { BuyForm } from "@/components/buy-form";
import { PayButton } from "@/components/pay-button";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ buy?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { title: true, description: true },
  });
  if (!product) return { title: "Товар не найден" };
  return {
    title: product.title,
    description: product.description || `Купить ${product.title} в маркетплейсе DilderGames`,
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { buy } = await searchParams;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      game: { select: { slug: true, title: true, image: true } },
      category: { select: { name: true } },
    },
  });

  if (!product || product.isHidden) notFound();

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;

  return (
    <div className="container-nexus py-10">
      {/* Хлебные крошки */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="transition-colors hover:text-violet-300">
          Главная
        </Link>
        <span>/</span>
        <Link href="/catalog" className="transition-colors hover:text-violet-300">
          Каталог
        </Link>
        <span>/</span>
        <Link
          href={`/game/${product.game.slug}`}
          className="transition-colors hover:text-violet-300"
        >
          {product.game.title}
        </Link>
        <span>/</span>
        <span className="text-slate-300">{product.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Изображение */}
        <div className="card overflow-hidden">
          <div className="relative aspect-[4/3] bg-nexus-800">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-nexus-700 to-nexus-800">
                <svg viewBox="0 0 24 24" fill="none" className="h-20 w-20 text-nexus-500" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            {discount && (
              <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
                −{discount}%
              </span>
            )}
          </div>
        </div>

        {/* Информация */}
        <div className="flex flex-col">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Link
              href={`/game/${product.game.slug}`}
              className="badge-blue transition-colors hover:bg-blue-500/25"
            >
              {product.game.title}
            </Link>
            <span className="badge-gray">{product.category.name}</span>
            {product.isTest && (
              <span className="badge-amber" title="Демонстрационный товар">
                Тестовый
              </span>
            )}
          </div>

          <h1 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
            {product.title}
          </h1>

          <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <StockBadge stock={product.stock} />
            {product.stock > 0 && (
              <span className="text-sm text-slate-500">
                Добавлено: {formatDateTime(product.createdAt)}
              </span>
            )}
          </div>

          <div className="mb-6 flex items-baseline gap-3">
            <span className="text-4xl font-black text-white">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xl text-slate-500 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {product.description && (
            <div className="mb-8">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Описание
              </h2>
              <div className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
                {product.description}
              </div>
            </div>
          )}

          {/* Форма покупки */}
          <div className="mt-auto">
            {product.stock > 0 ? (
              <>
                <BuyForm
                  productId={product.id}
                  autoOpen={buy === "1"}
                  title={product.title}
                  price={product.price}
                />
                <PayButton
                  label="Оплатить"
                  className="btn-secondary mt-3 w-full py-3.5"
                />
              </>
            ) : (
              <div className="card border-red-500/30 p-6 text-center">
                <p className="font-semibold text-red-300">
                  Товар временно отсутствует
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Оформить заказ нельзя — дождитесь пополнения или выберите другой
                  товар.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Информация о продавце */}
      <section className="card mt-10 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h2 className="font-semibold text-white">
              Товар от владельца площадки DilderGames
            </h2>
            <p className="mt-0.5 text-sm text-slate-400">
              Это закрытый маркетплейс: все товары выставляются только
              администратором. После оформления заказа владелец свяжется с вами
              по указанному контакту.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
