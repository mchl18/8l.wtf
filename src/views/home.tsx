"use client";
import { useState } from "react";
import Head from "next/head";

export default function HomeView() {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col items-center justify-center">
      <Head>
        <title>URL Shortener</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">URL Shortener</h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to shorten"
              required
              className="w-full p-4 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-black"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              Shorten
            </button>
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
      </main>
    </div>
  );
}
