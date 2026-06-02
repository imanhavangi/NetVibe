import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NetVibe | مانیتورینگ زنده و مردمی اختلالات اینترنت ایران",
  description: "سامانه جمع‌سپاری و سنجش لحظه‌ای وضعیت فیلترینگ و پایداری شبکه اینترنت همراه و ثابت در ایران",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="antialiased selection:bg-violet-500/30 selection:text-violet-200">
        {children}
      </body>
    </html>
  );
}
