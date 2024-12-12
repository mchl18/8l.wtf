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
    "Create short, custom URLs quickly and easily with our free URL shortener. Access our developer API for programmatic URL shortening. No Bullshit, no ads, just short links.",
  keywords:
    "URL shortener, link shortener, custom URLs, link tracking, marketing tools, URL shortener API, developer API, No Bullshit, no ads, just short links.",
  openGraph: {
    title: "veryshort.me",
    description:
      "Create short, custom URLs quickly and easily with our free URL shortener. Access our developer API for programmatic URL shortening. No Bullshit, no ads, just short links.",
    type: "website",
    url: getHostUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: "veryshort.me",
    description:
      "Create short, custom URLs quickly and easily with our free URL shortener. Access our developer API for programmatic URL shortening. No Bullshit, no ads, just short links.",
  },
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
      </body>
      <Analytics />
      <Toaster />
    </html>
  );
}
