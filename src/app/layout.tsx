import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "caridisni - Rekomendasi Barang Shopee Terbaik",
  description: "Temukan koleksi barang pilihan terbaik dengan harga diskon dari Shopee. Kurasi produk berkualitas tinggi.",
  keywords: ["shopee affiliate", "rekomendasi shopee", "barang murah shopee", "curation shopee"],
  authors: [{ name: "caridisni" }],
  openGraph: {
    title: "caridisni - Rekomendasi Barang Shopee Terbaik",
    description: "Temukan koleksi barang pilihan terbaik dengan harga diskon dari Shopee.",
    url: "https://caridisni.com", // Adjust as necessary
    siteName: "caridisni",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "caridisni - Rekomendasi Barang Shopee Terbaik",
    description: "Temukan koleksi barang pilihan terbaik dengan harga diskon dari Shopee.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  }
};

import FacebookPixel from '@/components/FacebookPixel';
import InitExternalId from '@/components/InitExternalId';
import { FB_PIXEL_ID } from '@/lib/fpixel';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-theme="light" style={{ scrollBehavior: 'smooth' }}>
      <body>
        <FacebookPixel />
        <InitExternalId />

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
