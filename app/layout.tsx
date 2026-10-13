import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

// Headings only.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

// Everything else: body, buttons, labels, UI, prices, technical data.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// viewport-fit=cover lets env(safe-area-inset-bottom) work on notched phones,
// so the sticky bar and cart footer clear the home indicator.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  title: "Yatsar 3D",
  description: "Physical 3D-printed products, made in India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
