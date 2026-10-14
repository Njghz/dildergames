"use client";

import { useState } from "react";

interface Props {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ title, onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-nexus-950/80 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="card w-full max-w-sm border-red-500/30 p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-red-400" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-bold text-white">Удалить товар?</h3>
        <p className="mb-6 text-sm text-slate-400">
          «{title}» будет удалён без возможности восстановления.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Отмена
          </button>
          <button
            onClick={confirm}
            disabled={loading}
            className="btn-danger flex-1"
          >
            {loading ? "Удаляем…" : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  );
}
