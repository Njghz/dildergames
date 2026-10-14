import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VisitorHeartbeat } from "@/components/visitor-heartbeat";

export const metadata: Metadata = {
  title: {
    default: "DilderGames — маркетплейс цифровых игровых товаров",
    template: "%s — DilderGames",
  },
  description:
    "DilderGames — закрытый маркетплейс цифровых игровых товаров. Аккаунты, валюта, предметы и услуги для Minecraft, GTA, CS2, Fortnite и других игр.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col">
        <VisitorHeartbeat />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
