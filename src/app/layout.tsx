import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "caridisni - Rekomendasi Barang Shopee Terbaik",
  description: "Temukan koleksi barang pilihan terbaik dengan harga diskon dari Shopee. Kurasi produk berkualitas tinggi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${outfit.variable}`} data-theme="light" style={{ scrollBehavior: 'smooth' }}>
      <body>{children}</body>
    </html>
  );
}
