import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { GameCard } from "@/components/game-card";
import { EmptyState } from "@/components/states";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Каталог игр",
  description: "Все игры, представленные в маркетплейсе DilderGames",
};

export default async function CatalogPage() {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: { products: { where: { isHidden: false } } },
      },
    },
    orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div className="container-nexus py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Каталог игр</h1>
        <p className="mt-1 text-sm text-slate-500">
          {games.length}{" "}
          {games.length === 1
            ? "игра"
            : games.length < 5
              ? "игры"
              : "игр"}{" "}
          в каталоге
        </p>
      </div>

      {games.length === 0 ? (
        <EmptyState
          title="Каталог пуст"
          description="Администратор ещё не добавил игры. Загляните позже."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
