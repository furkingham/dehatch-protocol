import type { Metadata } from "next";
import { Inter, Syne, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { WalletProvider } from "@/lib/wallet";
import { LanguageProvider } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeHatch — Decentralized Student Incubator",
  description:
    "A decentralized incubator that funds student projects milestone by milestone on the Stellar network. Safe, fast and transparent investing with USDC. / Öğrenci projelerini Stellar ağı üzerinde milestone bazlı fonlayan merkeziyetsiz kuluçka merkezi.",
  keywords: ["DeHatch", "Stellar", "blockchain", "crowdfunding", "Web3", "DeFi", "Soroban", "startup", "öğrenci"],
  openGraph: {
    title: "DeHatch — Hatch Your Vision, Safely.",
    description: "The decentralized nest for student innovators.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} ${serif.variable}`}>
      <body className="antialiased">
        <LanguageProvider>
          <WalletProvider>
            <Navbar />
            <main style={{ paddingTop: "var(--nav-height)" }}>{children}</main>
          </WalletProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
