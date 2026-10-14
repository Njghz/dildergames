import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
};

export default function ContactsPage() {
  return (
    <div className="container-nexus max-w-3xl py-12">
      <h1 className="mb-8 text-3xl font-bold text-white">Контакты</h1>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="card p-6">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-violet-400" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.2a2 2 0 012.1-.5c.9.3 1.9.6 2.8.7a2 2 0 011.7 2z" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mb-1 font-semibold text-white">Telegram</h2>
          <p className="text-sm text-slate-400">
            Основной канал связи с владельцем площадки. Ответ обычно в течение
            часа в рабочее время.
          </p>
          <a
            href="https://t.me/nexus_marketplace"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary mt-4 w-full"
          >
            @nexus_marketplace
          </a>
        </div>

        <div className="card p-6">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-blue-400" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 7l-10 6L2 7" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mb-1 font-semibold text-white">Электронная почта</h2>
          <p className="text-sm text-slate-400">
            Для официальных запросов и вопросов, требующих развёрнутого ответа.
          </p>
          <a href="mailto:support@dildergames.gg" className="btn-secondary mt-4 w-full">
            support@dildergames.gg
          </a>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-2 font-semibold text-white">Важно</h2>
        <p className="text-sm leading-relaxed text-slate-400">
          DilderGames — закрытый маркетплейс. Все товары выставляются только владельцем
          площадки. Если вам предлагают товары DilderGames на сторонних ресурсах — это
          мошенники. Проверяйте заказы только на этом сайте.
        </p>
      </div>
    </div>
  );
}
