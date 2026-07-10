import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "DopaBet — Simulador fictício de apostas esportivas",
  description:
    "Simulador 100% fictício de apostas esportivas para entretenimento. Nenhum dinheiro real envolvido.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-foreground font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
