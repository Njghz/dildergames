"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentModal } from "@/components/payment-modal";

interface PayButtonProps {
  /** Настоящий номер заказа из БД (показывается в окне). Без него блок скрывается. */
  orderNumber?: string | null;
  /** id заказа — если задан, по клику заказ переводится в NEW -> AWAITING_PAYMENT. */
  orderId?: string | null;
  /** Текст кнопки. */
  label?: string;
  /** Дополнительные классы для кнопки (например, размер/ширина). */
  className?: string;
}

/**
 * Кнопка «Оплатить»: открывает модальное окно с инструкцией по оплате
 * поверх текущей страницы (без перезагрузки). Если передан orderId —
 * дополнительно помечает заказ как ожидающий оплаты.
 * Заказ никогда не помечается оплаченным автоматически.
 */
export function PayButton({
  orderNumber,
  orderId,
  label = "Оплатить",
  className,
}: PayButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleClick() {
    setOpen(true);

    if (!orderId || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/payment-intent`, {
        method: "POST",
      });
      // Обновляем серверные компоненты, чтобы статус («Ожидает оплаты»)
      // отобразился на странице. Перезагрузки страницы нет.
      if (res.ok) router.refresh();
    } catch {
      // Сеть недоступна — окно уже открыто, ошибку не показываем,
      // чтобы не мешать пользователю взять инструкцию по оплате.
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={className ?? "btn-primary w-full py-4 text-base"}
      >
        {label}
      </button>

      <PaymentModal
        open={open}
        onClose={() => setOpen(false)}
        orderNumber={orderNumber}
      />
    </>
  );
}
