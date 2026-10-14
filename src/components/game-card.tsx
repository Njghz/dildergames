import Link from "next/link";

interface GameCardProps {
  game: {
    slug: string;
    title: string;
    image: string | null;
    _count?: { products: number };
  };
}

export function GameCard({ game }: GameCardProps) {
  const count = game._count?.products ?? 0;

  return (
    <Link
      href={`/game/${game.slug}`}
      className="card group relative block overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-violet-900/30"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-nexus-800">
        {game.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.image}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-nexus-700 to-nexus-800">
            <span className="text-4xl font-black text-nexus-500">
              {game.title.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-nexus-950/90 via-nexus-950/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white transition-colors group-hover:text-violet-300">
            {game.title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {count > 0
              ? `${count} ${count === 1 ? "товар" : count < 5 ? "товара" : "товаров"}`
              : "Скоро появятся товары"}
          </p>
        </div>
      </div>
    </Link>
  );
}
