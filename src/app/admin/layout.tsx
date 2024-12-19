import { Pixelify_Sans } from "next/font/google";
import "../globals.css";
import { Metadata } from "next";
import { getHostUrl } from "@/lib/utils";
import Providers from "@/lib/providers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

const pixelify = Pixelify_Sans({ subsets: ["latin"] });

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
      <body className={pixelify.className}>
        <Providers>
          <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            <div className="flex flex-col gap-4 px-4 sm:px-6 md:px-8">
              <div className="flex flex-row gap-4 items-end">
                <Link className="flex-1" href={`/`}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
                  >
                    <HomeIcon className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="flex flex-col">
                  <h1 className="text-purple-600 text-2xl text-center">
                    8l.wtf
                  </h1>
                  <p className="text-purple-600 text-center">
                    8 letters is all you need.
                  </p>
                  <p className="text-purple-600 text-center">
                    Anonymous, encrypted, and fast.
                  </p>
                </div>
                <div className="flex-1"></div>
              </div>
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
