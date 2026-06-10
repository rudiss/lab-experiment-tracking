import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lab Tracker",
  description: "Laboratory experiment tracking system",
};

// Every page reads live data from Postgres, so render on each request rather than
// statically prerendering at build time.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="flex min-h-screen">
          <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white px-3 py-5 md:block">
            <Link href="/" className="mb-6 block px-3">
              <span className="text-lg font-semibold tracking-tight text-slate-900">🧪 Lab Tracker</span>
            </Link>
            <Nav />
          </aside>
          <main className="flex-1 px-5 py-8 md:px-10">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
