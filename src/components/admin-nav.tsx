"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/admin",
    label: "Дашборд",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Товары",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
        <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" strokeLinejoin="round" />
        <path d="M3 8l9 5 9-5M12 13v8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/games",
    label: "Игры",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
        <path d="M6 12h4m-2-2v4m7-3h.01M18 13h.01M17.3 5H6.7a4.7 4.7 0 00-4.6 5.6l.9 4.6A3 3 0 006 17.6c.8 0 1.5-.3 2-.9L9.4 15h5.2l1.4 1.7c.5.6 1.2.9 2 .9a3 3 0 003-2.4l.9-4.6A4.7 4.7 0 0017.3 5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Категории",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Заказы",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
        <path d="M9 5h11M9 12h11M9 19h11" strokeLinecap="round" />
        <circle cx="4" cy="5" r="1" fill="currentColor" />
        <circle cx="4" cy="12" r="1" fill="currentColor" />
        <circle cx="4" cy="19" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 p-2">
      {links.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
              active
                ? "bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-500/30"
                : "text-slate-400 hover:bg-nexus-800 hover:text-white"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
