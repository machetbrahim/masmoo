import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مسموع — استوديو تحويل النص إلى صوت",
  description:
    "حوّل أي نص إلى ملف صوتي احترافي بأصوات عصبية متعددة اللغات، مع موسيقى مولَّدة حسب المحتوى أو مرفقة، مزج ذكي، وتحميل مباشر بصيغتي MP3 وWAV.",
};

export const viewport: Viewport = {
  themeColor: "#05060b",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`}>
      <body className="bg-[#05060b] font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
