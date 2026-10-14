"use client";

import { useEffect } from "react";
import { HEARTBEAT_INTERVAL_MS } from "@/lib/heartbeat";

/**
 * Heartbeat администратора в админ-панели.
 * - Пингует защищённый /api/presence/admin каждые 30 секунд.
 * - При 401 (сессия истекла) останавливается — активность уйдёт с онлайна
 *   автоматически по истечении окна, либо сразу по "offline" на закрытии вкладки.
 * - При закрытии вкладки шлёт "offline" через sendBeacon.
 */
export function AdminHeartbeat() {
  useEffect(() => {
    let alive = true;

    async function send(action: "online" | "offline") {
      const body = JSON.stringify({ action });
      try {
        if (action === "offline" && typeof navigator.sendBeacon === "function") {
          navigator.sendBeacon("/api/presence/admin", body);
          return;
        }
        const res = await fetch("/api/presence/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
        if (res.status === 401) {
          // Сессия истекла — перестаём пинговать
          alive = false;
          window.clearInterval(id);
        }
      } catch {
        // сеть недоступна — пропускаем тик
      }
    }

    send("online");
    const id = window.setInterval(() => {
      if (alive && document.visibilityState === "visible") send("online");
    }, HEARTBEAT_INTERVAL_MS);

    const onVisibility = () => {
      if (alive && document.visibilityState === "visible") send("online");
    };
    // offline шлём только при закрытии/перезагрузке вкладки;
    // истечение сессии обрабатывается ответом 401 выше.
    const onPageHide = () => send("offline");

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  return null;
}
