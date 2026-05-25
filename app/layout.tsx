import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// 日本語ディスプレイ書体（特徴のある見出し用）
const zen = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-zen",
  display: "swap",
});

// 等幅（コード/メトリクス/ラベル用）
const jb = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KATA — AI駆動経営エージェント",
  description: "KATAは、AI駆動経営をサポートするビジネスAIエージェント群です。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${zen.variable} ${jb.variable}`}>
      <body>{children}</body>
    </html>
  );
}
