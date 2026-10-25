import "./globals.css";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { MotionRoot } from "@/components/fx";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-body" });

export const metadata: Metadata = { title: "Dinlio AI · Sesli resepsiyonist", description: "Telefonunuza yapay zeka cevap versin, rezervasyonlar kendiliğinden gelsin." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans"><MotionRoot><AuthProvider>{children}</AuthProvider></MotionRoot></body>
    </html>
  );
}
