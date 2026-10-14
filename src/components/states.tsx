import Link from "next/link";

/** Скелетон сетки карточек во время загрузки */
export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-[4/3] rounded-none" />
          <div className="space-y-2.5 p-4">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-3 w-1/2" />
            <div className="skeleton h-6 w-1/3" />
            <div className="flex gap-2 pt-1">
              <div className="skeleton h-9 flex-1" />
              <div className="skeleton h-9 flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Пустое состояние */
export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-nexus-700/50">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-8 w-8 text-slate-500"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="mb-1 text-lg font-semibold text-slate-200">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-sm text-slate-400">{description}</p>
      )}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

/** Состояние ошибки */
export function ErrorState({ message }: { message: string }) {
  return (
    <div className="card border-red-500/30 px-6 py-12 text-center">
      <div className="mb-3 text-4xl">⚠️</div>
      <h3 className="mb-1 text-lg font-semibold text-red-300">Произошла ошибка</h3>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
