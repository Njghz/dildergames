"use client";

import { useEffect, useRef } from "react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  /** Настоящий номер заказа из БД. Если нет — блок с номером не показывается. */
  orderNumber?: string | null;
}

const TELEGRAM_URL = "https://t.me/TimberTCK";
const TELEGRAM_HANDLE = "@TimberTCK";

/**
 * Модальное окно с инструкцией по оплате и контактом Telegram.
 * Открывается поверх текущей страницы, без перезагрузки.
 * Закрывается: по кнопке, по клику на подложку, по Escape.
 */
export function PaymentModal({ open, onClose, orderNumber }: PaymentModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Escape + блокировка скролла фона, пока окно открыто
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-nexus-950/80 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-md border-violet-500/30 p-6 outline-none sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 text-white"
                aria-hidden="true"
              >
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
              </svg>
            </span>
            <h3
              id="payment-modal-title"
              className="text-lg font-bold text-white"
            >
              Оплата заказа
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-nexus-800 hover:text-slate-300"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="mb-5 text-sm leading-relaxed text-slate-400">
          Чтобы оплатить заказ, напиши нам в Telegram. Мы объясним, как
          произвести оплату, и поможем завершить покупку.
        </p>

        {orderNumber && (
          <div className="mb-4 rounded-xl bg-nexus-800/80 px-4 py-3 text-sm">
            <span className="text-slate-500">Номер заказа: </span>
            <span className="font-mono font-semibold text-violet-300">
              #{orderNumber}
            </span>
          </div>
        )}

        <div className="mb-6 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
          <p className="text-sm text-slate-300">
            По вопросам оплаты пиши сюда:
          </p>
          <p className="mt-1 text-lg font-bold text-white">{TELEGRAM_HANDLE}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
            </svg>
            Написать в Telegram
          </a>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
