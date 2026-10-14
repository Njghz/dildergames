const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  NEW: { label: "Новый", className: "badge-violet" },
  AWAITING_PAYMENT: { label: "Ожидает оплаты", className: "badge-amber" },
  PAID: { label: "Оплачен", className: "badge-blue" },
  IN_PROGRESS: { label: "Выполняется", className: "badge-blue" },
  COMPLETED: { label: "Завершён", className: "badge-green" },
  CANCELLED: { label: "Отменён", className: "badge-red" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: "badge-gray" };
  return <span className={cfg.className}>{cfg.label}</span>;
}

export function orderStatusLabel(status: string): string {
  return statusConfig[status]?.label ?? status;
}
