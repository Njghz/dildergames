import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { StockBadge } from "@/components/stock-badge";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    oldPrice: number | null;
    image: string | null;
    stock: number;
    game: { title: string };
    category: { name: string };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;

  return (
    <div className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-violet-900/30">
      {/* Изображение */}
      <div className="relative aspect-[4/3] overflow-hidden bg-nexus-800">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-nexus-700 to-nexus-800">
            <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12 text-nexus-500" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        {discount && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            −{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-nexus-950/60 backdrop-blur-[2px]">
            <span className="badge-red px-3 py-1.5 text-sm">Нет в наличии</span>
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
          <span className="badge-blue">{product.game.title}</span>
          <span className="truncate">{product.category.name}</span>
        </div>

        <Link href={`/product/${product.id}`} className="group/title">
          <h3 className="mb-2 line-clamp-2 font-semibold leading-snug text-slate-100 transition-colors group-hover/title:text-violet-300">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <StockBadge stock={product.stock} />
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-lg font-bold text-white">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-sm text-slate-500 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Link
            href={`/product/${product.id}`}
            className="btn-secondary flex-1 px-3 py-2 text-xs"
          >
            Подробнее
          </Link>
          <Link
            href={`/product/${product.id}?buy=1`}
            className="btn-primary flex-1 px-3 py-2 text-xs"
            aria-disabled={product.stock === 0}
          >
            Купить
          </Link>
        </div>
      </div>
    </div>
  );
}
