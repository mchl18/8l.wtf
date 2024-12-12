import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { getHostUrl } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "veryshort.me",
  description:
    "Open source, secure URL shortener with strong encryption. Create short links for free with our developer-friendly API. No tracking, no ads, fully transparent code. Github link included.",
  keywords:
    "URL shortener, open source, encryption, secure links, free URL shortener, developer API, transparent code, privacy focused, no tracking",
  openGraph: {
    title: "veryshort.me",
    description:
      "Open source, secure URL shortener with strong encryption. Create short links for free with our developer-friendly API. No tracking, no ads, fully transparent code. Github link included.",
    type: "website",
    url: getHostUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: "veryshort.me",
    description:
      "Open source, secure URL shortener with strong encryption. Create short links for free with our developer-friendly API. No tracking, no ads, fully transparent code. Github link included.",
  },
  authors: [{ name: "Michael Gerullis", url: "https://mgerullis.com" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          {children}
        </div>
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
