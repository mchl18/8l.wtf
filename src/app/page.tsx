"use client";
import { Button } from "@/components/ui/button";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    setShortUrl(`${window.location.origin}/${data.shortId}`);
  };

  return (
    <>
      <main className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center mt-24">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">veryshort.me</h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to shorten"
              required
              className="w-full p-4 pr-24 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-black"
            />
            <Button
              type="submit"
              className="absolute right-2 top-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              Shorten
            </Button>
          </div>
        </form>
        {shortUrl && (
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-gray-700 mb-2">Shortened URL:</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 break-all"
            >
              {shortUrl}
            </a>
          </div>
        )}

        <Analytics />
      </main>
      <Link
        href="/api"
        className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-md shadow transition duration-150 mt-4"
      >
        API Documentation
      </Link>
      <Link
        href="/delete-proxy"
        className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-md shadow transition duration-150 mt-4"
      >
        Delete Proxy
      </Link>
    </>
  );
}
