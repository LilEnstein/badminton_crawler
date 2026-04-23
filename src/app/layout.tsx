import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bebas_Neue, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";

import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const plusJakarta = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "BadmintonFinder",
  description: "Find badminton sessions that match your level, area, and budget."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${bebasNeue.variable} ${plusJakarta.variable} ${spaceMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
