import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getLocale } from "@/i18n/server";
import { getDictionary } from "@/i18n/dictionaries";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// This app is fully dynamic (auth/session + per-request DB). Disable static
// prerendering so build never evaluates next-auth/env at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Keel — The backbone of high-performing teams",
  description:
    "Keel is an adaptive people operating system. Manage people, performance, feedback, leave, and goals without the weight of traditional HR software.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" }
    ],
    apple: "/apple-touch-icon.png"
  }
};

export const viewport = {
  themeColor: "#4E2BD6"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const dict = getDictionary(locale);
  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers><I18nProvider locale={locale} dict={dict}>{children}</I18nProvider></Providers>
      </body>
    </html>
  );
}
