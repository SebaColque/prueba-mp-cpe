import type {Metadata} from "next";

import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js + Mercado Pago",
  description: "Como integrar Mercado Pago en una aplicación Next.js - By Goncy",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="dark container m-auto grid min-h-screen max-w-screen-sm grid-rows-[auto,1fr,auto] px-4 font-sans antialiased">
        <header className="flex items-center justify-between">
          <Link className="text-xl font-bold leading-[4rem]" href="/">
            
          </Link>
        </header>
        <main className="py-8">{children}</main>
        <footer className="text-center leading-[4rem] opacity-70">
          
        </footer>
      </body>
    </html>
  );
}
