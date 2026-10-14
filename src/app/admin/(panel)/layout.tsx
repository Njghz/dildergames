import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { AdminHeartbeat } from "@/components/admin-heartbeat";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Серверная проверка прав администратора
  const session = await requireAdmin();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-nexus-950">
      <AdminHeartbeat />
      {/* Боковая навигация (десктоп) */}
      <aside className="hidden w-52 shrink-0 flex-col border-r border-nexus-700/50 bg-nexus-900/60 lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-nexus-700/50 px-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-blue-600">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" className="h-3.5 w-3.5 text-white" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <span className="text-sm font-extrabold text-white">
              Dilder<span className="gradient-text">Games</span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-slate-500">
              Админ
            </span>
          </div>
        </div>
        <AdminNav />
        <div className="mt-auto border-t border-nexus-700/50 p-3">
          <Link
            href="/"
            className="block rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-nexus-800 hover:text-white"
          >
            ← Перейти на сайт
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Мобильная шапка */}
        <div className="flex h-14 items-center justify-between border-b border-nexus-700/50 bg-nexus-900/60 px-4 lg:hidden">
          <span className="text-sm font-extrabold text-white">
            Dilder<span className="gradient-text">Games</span>
            <span className="ml-2 text-xs font-normal text-slate-500">Админ</span>
          </span>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">
            На сайт →
          </Link>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row">
          {/* Мобильная навигация */}
          <nav className="flex gap-1 overflow-x-auto border-b border-nexus-700/50 bg-nexus-900/40 px-3 py-2 lg:hidden">
            <MobileNavLink href="/admin">Дашборд</MobileNavLink>
            <MobileNavLink href="/admin/products">Товары</MobileNavLink>
            <MobileNavLink href="/admin/games">Игры</MobileNavLink>
            <MobileNavLink href="/admin/categories">Категории</MobileNavLink>
            <MobileNavLink href="/admin/orders">Заказы</MobileNavLink>
          </nav>

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-nexus-800 hover:text-white"
    >
      {children}
    </Link>
  );
}
