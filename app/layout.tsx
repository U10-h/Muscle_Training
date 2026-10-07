import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REPNOTE | 自分のペースで、積み重ねる",
  description: "自分の予定に合わせた筋トレ記録、タイマー、フォーム確認とマイキャラ育成。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
