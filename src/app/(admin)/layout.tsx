import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "../globals.css";

const nunito = Nunito({ subsets: ["latin", "latin-ext"], variable: "--font-nunito" });

export const metadata: Metadata = { title: "Admin · Velence Resort & Spa", robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="min-h-dvh bg-sand-100 text-navy-900">{children}</body>
    </html>
  );
}
