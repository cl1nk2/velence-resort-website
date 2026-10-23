import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin", "latin-ext"], variable: "--font-nunito" });

export const metadata: Metadata = { title: "404 – Velence Resort & Spa" };

export default function GlobalNotFound() {
  return (
    <html lang="hu" className={nunito.variable}>
      <body className="grid min-h-dvh place-items-center bg-navy-800 p-6 text-center text-white">
        <main>
          <p className="text-8xl font-black text-white/20">404</p>
          <h1 className="mt-2 text-3xl font-bold">Az oldal nem található · Page not found</h1>
          <p className="mt-6 flex justify-center gap-3">
            <a href="/hu" className="rounded-full bg-white px-6 py-3 font-bold text-navy-800">
              Kezdőlap
            </a>
            <a href="/en" className="rounded-full border-2 border-white px-6 py-3 font-bold">
              Home
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
