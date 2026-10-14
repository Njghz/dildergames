"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { HEARTBEAT_INTERVAL_MS } from "@/lib/heartbeat";

/**
 * Heartbeat посетителя публичного сайта.
 * - Пингует сервер каждые 30 секунд, обновляя время активности.
 * - При закрытии/скрытии вкладки шлёт "offline" через sendBeacon.
 * - На страницах /admin не работает (там крутится AdminHeartbeat).
 */
export function VisitorHeartbeat() {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (isAdminArea) return;

    let alive = true;

    function send(action: "online" | "offline") {
      const body = JSON.stringify({ action });
      if (action === "offline" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/presence/visitor", body);
        return;
      }
      fetch("/api/presence/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }

    send("online");
    const id = window.setInterval(() => {
      if (alive && document.visibilityState === "visible") send("online");
    }, HEARTBEAT_INTERVAL_MS);

    const onVisibility = () => {
      if (alive && document.visibilityState === "visible") send("online");
    };
    // offline шлём только при реальном закрытии/перезагрузке вкладки.
    // Окно ONLINE_WINDOW_MS само снимет с онлайна при бездействии.
    const onPageHide = () => send("offline");

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [isAdminArea]);

  return null;
}
