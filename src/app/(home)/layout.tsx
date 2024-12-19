import { Pixelify_Sans } from "next/font/google";
import "../globals.css";
import { Metadata } from "next";
import { getHostUrl } from "@/lib/utils";
import Providers from "@/lib/providers";

const pixelify = Pixelify_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "8l.wtf",
  description:
    "8 letters is all you need. anonymous, encrypted, and fast. open source, secure url shortener with strong encryption. create short links for free with our developer-friendly api. no tracking, no ads, fully transparent code. github link included.",
  openGraph: {
    title: "8l.wtf",
    description:
      "8 letters is all you need. anonymous, encrypted, and fast. open source, secure url shortener with strong encryption. create short links for free with our developer-friendly api. no tracking, no ads, fully transparent code. github link included.",
    type: "website",
    url: getHostUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: "8l.wtf",
    description:
      "8 letters is all you need. anonymous, encrypted, and fast. open source, secure url shortener with strong encryption. create short links for free with our developer-friendly api. no tracking, no ads, fully transparent code. github link included.",
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
      <body className={pixelify.className}>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <h1 className="text-purple-600 text-2xl mt-12 lg:mt-24">8l.wtf</h1>
          <p className="text-purple-600 text-center">
            8 letters is all you need.
          </p>
          <p className="text-purple-600 text-center">
            anonymous, encrypted, and fast.
          </p>
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
