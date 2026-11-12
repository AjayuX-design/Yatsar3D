import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { indexingOn, siteUrl } from "@/lib/site";
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

const description = "3D-printed products for your desk and home, and custom prints made for you. From idea to reality.";

// The share card for WhatsApp, Instagram and search results comes from app/opengraph-image.png. Product pages use their own photo.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  alternates: { canonical: "./" }, // each page names itself, without filters or tracking tags
  robots: indexingOn() ? undefined : { index: false, follow: false },
  title: "Yatsar 3D",
  description,
  openGraph: {
    type: "website",
    siteName: "Yatsar 3D",
    locale: "en_IN",
    title: "Yatsar 3D",
    description,
  },
  twitter: { card: "summary_large_image", title: "Yatsar 3D", description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-ctl focus:bg-ink focus:px-4 focus:py-3 focus:t-label focus:text-surface"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
