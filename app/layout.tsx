import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { siteUrl } from "@/lib/site";
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
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

const description = "Physical 3D-printed products, made in India. Size, material and timing on every page.";

// The share card for WhatsApp, Instagram and search results. Product pages use their own photo.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "Yatsar 3D",
  description,
  openGraph: {
    type: "website",
    siteName: "Yatsar 3D",
    locale: "en_IN",
    title: "Yatsar 3D",
    description,
    images: [{ url: "/products/square/fear-not-magnet-front-1200.jpg", width: 1200, height: 1200, alt: "Yatsar 3D" }],
  },
  twitter: { card: "summary_large_image", title: "Yatsar 3D", description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
