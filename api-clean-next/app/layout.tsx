import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";
import { AuthProvider } from "@/app/context/AuthContext";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import { ThemeProvider } from "@/app/components/layout/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Humberto Vitalino",
    template: "%s · Humberto Vitalino",
  },
  description: "Software engineer. Notes on what I read, play and build.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground"
            >
              Skip to content
            </a>
            {/* The frame: the page's ground with the content on a column edged like a sheet.
                It's fixed behind everything, so it runs the full height however short the page. */}
            <div aria-hidden className="pointer-events-none fixed inset-0 flex justify-center sm:px-8">
              <div className="flex w-full max-w-7xl lg:px-8">
                <div className="w-full sm:bg-card sm:ring-1 sm:ring-secondary" />
              </div>
            </div>
            <div className="relative flex w-full flex-1 flex-col">
              <Header />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
