"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HEARTBEAT_INTERVAL_MS } from "@/lib/heartbeat";

/**
 * Периодически обновляет серверные данные страницы (router.refresh),
 * чтобы счётчики онлайна на дашборде оставались актуальными.
 */
export function OnlineRefresh() {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, HEARTBEAT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [router]);

  return null;
}
