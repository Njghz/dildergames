import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-nexus flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="gradient-text mb-4 text-7xl font-black">404</p>
      <h1 className="mb-2 text-2xl font-bold text-white">Страница не найдена</h1>
      <p className="mb-8 max-w-md text-sm text-slate-400">
        Возможно, страница была удалена или перемещена. Попробуйте вернуться на
        главную или воспользоваться поиском.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary">
          На главную
        </Link>
        <Link href="/catalog" className="btn-secondary">
          Каталог игр
        </Link>
      </div>
    </div>
  );
}
