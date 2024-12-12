import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fast & Secure URL Shortener with API | Shorten Your Links Instantly | No Bullshit, no ads, just short links.",
  description:
    "Create short, custom URLs quickly and easily with our free URL shortener. Access our developer API for programmatic URL shortening. No Bullshit, no ads, just short links.",
  keywords:
    "URL shortener, link shortener, custom URLs, link tracking, marketing tools, URL shortener API, developer API, No Bullshit, no ads, just short links.",
  openGraph: {
    title: "Fast & Secure URL Shortener with API | Shorten Your Links Instantly | No Bullshit, no ads, just short links.",
    description:
      "Create short, custom URLs quickly and easily with our free URL shortener. Access our developer API for programmatic URL shortening. No Bullshit, no ads, just short links.",
    type: "website",
    url: "https://your-domain.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fast & Secure URL Shortener with API | Shorten Your Links Instantly | No Bullshit, no ads, just short links.",
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
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
