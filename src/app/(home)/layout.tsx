import { Metadata } from "next";
import { getHostUrl } from "@/lib/utils";
import Providers from "@/lib/providers";
import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-purple-600 text-2xl mt-12 lg:mt-24">8l.wtf</h1>
      <p className="text-purple-600 text-center">8 letters is all you need.</p>
      <p className="text-purple-600 text-center">
        anonymous, encrypted, and fast.
      </p>
      <Providers>{children}</Providers>

      <Link
        href="/api"
        className="text-purple-600 ring-1 ring-purple-500 font-medium py-2 px-4 rounded-md shadow transition duration-150 mt-4"
      >
        API Documentation
      </Link>
      <Link
        href="/delete-proxy"
        className="text-purple-600 ring-1 ring-purple-500 font-medium py-2 px-4 rounded-md shadow transition duration-150 mt-4"
      >
        Delete Proxy
      </Link>
      <Link
        href="https://github.com/mchl18/8l.wtf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-600 ring-1 ring-purple-500 font-medium py-2 px-4 rounded-md shadow transition duration-150 mt-4"
      >
        GitHub
      </Link>

      <Link
        href={`https://status.mgerullis.com/status/8l-wtf`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="https://status.mgerullis.com/api/badge/1/uptime?style=social"
          alt="uptime"
          unoptimized
          width={150}
          height={23}
          className="mt-8"
        />
      </Link>
    </div>
  );
}
