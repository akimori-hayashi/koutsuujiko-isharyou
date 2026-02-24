import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "交通事故慰謝料計算ツール",
  description:
    "交通事故の慰謝料相場を自賠責基準・弁護士基準で計算し、AIが結果を解説します。",
  openGraph: {
    title: "交通事故慰謝料計算ツール",
    description:
      "交通事故の慰謝料相場を自賠責基準・弁護士基準で計算し、AIが結果を解説します。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
