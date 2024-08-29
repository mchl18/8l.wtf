'use client';
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
    <div className="container mx-auto px-4">
      <Head>
        <title>URL Shortener</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="mt-10">
        <h1 className="text-4xl font-bold mb-4">URL Shortener</h1>
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to shorten"
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Shorten URL
          </button>
        </form>
        {shortUrl && (
          <div>
            <p>Shortened URL:</p>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              {shortUrl}
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
