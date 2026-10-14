"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface BuyFormProps {
  productId: string;
  title: string;
  price: number;
  autoOpen?: boolean;
}

export function BuyForm({ productId, title, price, autoOpen }: BuyFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(autoOpen));
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, customerName: name, contact, comment }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Не удалось оформить заказ");
        return;
      }
      router.push(`/order/${data.order.id}/success?number=${encodeURIComponent(data.order.number)}`);
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary w-full py-4 text-base">
        Купить за {formatPrice(price)}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 border-violet-500/30 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Оформление заказа</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-slate-500 transition-colors hover:text-slate-300"
          aria-label="Закрыть"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="rounded-xl bg-nexus-800/80 p-4">
        <p className="truncate text-sm text-slate-300">{title}</p>
        <p className="mt-1 text-lg font-bold text-white">
          Итого: {formatPrice(price)}
        </p>
      </div>

      <div>
        <label htmlFor="buy-name" className="label">
          Ваше имя
        </label>
        <input
          id="buy-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={1}
          maxLength={80}
          placeholder="Как к вам обращаться"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="buy-contact" className="label">
          Telegram или e-mail <span className="text-red-400">*</span>
        </label>
        <input
          id="buy-contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          minLength={3}
          maxLength={120}
          placeholder="@username или example@mail.ru"
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">
          Владелец площадки свяжется с вами для передачи товара
        </p>
      </div>

      <div>
        <label htmlFor="buy-comment" className="label">
          Комментарий к заказу <span className="text-slate-500">(необязательно)</span>
        </label>
        <textarea
          id="buy-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Пожелания или уточнения по заказу"
          className="input resize-none"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Оформляем…
          </span>
        ) : (
          `Подтвердить заказ — ${formatPrice(price)}`
        )}
      </button>

      <p className="text-center text-xs text-slate-500">
        Онлайн-оплата пока не подключена. После оформления заказа владелец
        площадки свяжется с вами и предложит удобный способ оплаты.
      </p>
    </form>
  );
}
