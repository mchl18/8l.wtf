import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { getHostUrl } from "@/lib/utils";
import Providers from "@/lib/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "8l.wtf",
  description:
    "8 letters is all you need. Anonymous, encrypted, and fast. Open source, secure URL shortener with strong encryption. Create short links for free with our developer-friendly API. No tracking, no ads, fully transparent code. Github link included.",
  openGraph: {
    title: "8l.wtf",
    description:
      "8 letters is all you need. Anonymous, encrypted, and fast. Open source, secure URL shortener with strong encryption. Create short links for free with our developer-friendly API. No tracking, no ads, fully transparent code. Github link included.",
    type: "website",
    url: getHostUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: "8l.wtf",
    description:
      "8 letters is all you need. Anonymous, encrypted, and fast. Open source, secure URL shortener with strong encryption. Create short links for free with our developer-friendly API. No tracking, no ads, fully transparent code. Github link included.",
  },
  authors: [{ name: "8l.wtf", url: "https://8l.wtf" }],
  keywords: ["API", "URL shortener", "documentation", "8l.wtf", "REST API"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="dark" lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
