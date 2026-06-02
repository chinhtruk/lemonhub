import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

type CategoryId = 
  | 'phone-tablet'
  | 'laptop'
  | 'audio'
  | 'watch-camera'
  | 'pc-monitor'
  | 'tv'
  | 'trade-in'
  | null;

export const metadata: Metadata = {
  title: "LemonHub - Điện thoại, laptop, phụ kiện chính hãng",
  description: "Cửa hàng điện thoại, laptop và phụ kiện chính hãng",
};

interface CategoryStore {
  selectedCategory: CategoryId;
  setSelectedCategory: (category: CategoryId) => void;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
