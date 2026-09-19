import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

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

export const metadata: Metadata = {
  title: "DeHatch — Merkeziyetsiz Öğrenci Kuluçka Merkezi",
  description:
    "Öğrenci projelerini Stellar ağı üzerinde milestone-bazlı fonlayan merkeziyetsiz kuluçka platformu. USDC ile güvenli, hızlı ve şeffaf yatırım. Zero rug-pulls.",
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
    <html lang="tr" className={`${inter.variable} ${syne.variable}`}>
      <body className="antialiased">
        <Navbar />
        <main style={{ paddingTop: "var(--nav-height)" }}>{children}</main>
      </body>
    </html>
  );
}
