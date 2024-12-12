"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getHostUrl } from "@/lib/utils";

export default function ApiPage() {
  const [url, setUrl] = useState("");
  const [shortId, setShortId] = useState("");
  const [fullUrl, setFullUrl] = useState("");
  const [deleteProxyUrl, setDeleteProxyUrl] = useState("");
  const [error, setError] = useState("");
  const hostUrlRef = useRef(getHostUrl());
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to shorten URL");
      }

      const data = await response.json();
      setShortId(data.shortId);
      setFullUrl(data.fullUrl);
      setDeleteProxyUrl(data.deleteProxyUrl);
      setError("");
    } catch (err) {
      setError("Failed to shorten URL");
    }
  };

  return (
    <>
      <div className="max-w-full mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8 text-white">
          veryshort.me API
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            API Endpoints
          </h2>

          <div className="space-y-8">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                1. Shorten URL
              </h3>
              <p className="mb-3">
                <code className="bg-gray-100 px-3 py-1 rounded-md text-sm font-mono">
                  POST /api/shorten
                </code>
              </p>
              <p className="text-gray-600 mb-2">Request body:</p>
              <pre className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                {`{
  "url": "https://example.com"
}`}
              </pre>
              <p className="text-gray-600 mt-3 mb-2">Response:</p>
              <pre className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                {`{
  "shortId": "abc123xy",
  "fullUrl": "${hostUrlRef.current}/abc123xy",
  "deleteProxyUrl": "${hostUrlRef.current}/api/delete-proxy?id=abc123xy"
}`}
              </pre>
            </div>

            {/* <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                2. Get Original URL
              </h3>
              <p className="mb-3">
                <code className="bg-gray-100 px-3 py-1 rounded-md text-sm font-mono">
                  GET /api/[shortId]
                </code>
              </p>
              <p className="text-gray-600 mb-2">Response:</p>
              <pre className="bg-gray-50 p-4 rounded-md font-mono text-sm overflow-x-auto">
                {`{
  "url": "https://example.com",
  "shortId": "abc123xy"
}`}
              </pre>
            </div> */}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Try it out</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="url"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Enter URL to shorten:
              </label>
              <Input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="https://example.com"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
            >
              Shorten URL
            </Button>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {fullUrl && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-gray-700 font-medium mb-2">Shortened URL:</p>
              <a
                href={fullUrl}
                className="text-blue-600 hover:text-blue-800 break-all font-mono text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {fullUrl}
              </a>
            </div>
          )}
          {shortId && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-gray-700 font-medium mb-2">Short ID:</p>
              <a
                href={`/${shortId}`}
                className="text-blue-600 hover:text-blue-800 break-all font-mono text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {shortId}
              </a>
            </div>
          )}
          {deleteProxyUrl && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-gray-700 font-medium mb-2">
                Delete Proxy URL:
              </p>
              <p className="text-gray-700 text-sm mb-2">
                Note: This URL requires a DELETE request. You can click below to
                view the proxy URL, but to delete you&apos;ll need to make a
                DELETE request to it.
              </p>
              <a
                href={deleteProxyUrl}
                className="text-blue-600 hover:text-blue-800 break-all font-mono text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {deleteProxyUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
