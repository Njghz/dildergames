import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Как получить товар",
};

const steps = [
  {
    title: "Оформите заказ",
    text: "Нажмите «Купить» на странице товара, укажите имя и контакт (Telegram или e-mail), подтвердите заказ.",
  },
  {
    title: "Дождитесь связи",
    text: "Владелец площадки напишет вам в течение рабочего дня, подтвердит наличие товара и предложит способ оплаты.",
  },
  {
    title: "Оплатите заказ",
    text: "Онлайн-оплата пока не подключена — оплата производится напрямую владельцу площадки согласованным способом.",
  },
  {
    title: "Получите товар",
    text: "После подтверждения оплаты вы получите товар: данные аккаунта, коды активации, валюту в игре или доступ к услуге — в зависимости от товара.",
  },
];

export default function DeliveryPage() {
  return (
    <div className="container-nexus max-w-3xl py-12">
      <h1 className="mb-8 text-3xl font-bold text-white">Как получить товар</h1>

      <div className="space-y-4">
        {steps.map((s, i) => (
          <div key={s.title} className="card flex gap-5 p-6">
            <span className="gradient-text shrink-0 text-2xl font-black">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="mb-1 font-semibold text-white">{s.title}</h2>
              <p className="text-sm leading-relaxed text-slate-400">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6 border-amber-500/20 bg-amber-500/5 p-6">
        <p className="text-sm leading-relaxed text-slate-300">
          <strong className="text-amber-300">Обратите внимание:</strong> оплата
          производится напрямую владельцу площадки после подтверждения заказа.
          Сайт не имитирует оплату и не хранит платёжные данные покупателей.
        </p>
      </div>
    </div>
  );
}
