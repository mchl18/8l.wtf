"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getHostUrl } from "@/lib/utils";

/**
 * Props for the ApiEndpoint component
 */
type ApiEndpointProps = {
  /** Title of the API endpoint */
  title: string;
  /** HTTP method (GET, POST, DELETE etc) */
  method: string;
  /** API endpoint URL path */
  endpoint: string;
  /** Example request body as a string */
  requestBody: string;
  /** Example response body as a string */
  responseBody: string;
};

/**
 * Component to display and test an individual API endpoint
 */
function ApiEndpoint({
  title,
  method,
  endpoint,
  requestBody,
  responseBody,
}: ApiEndpointProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Get color styling based on HTTP method
   */
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "POST":
        return "text-blue-500 border-blue-500";
      case "GET":
        return "text-green-500 border-green-500";
      case "DELETE":
        return "text-red-500 border-red-500";
      default:
        return "text-purple-600 border-purple-600";
    }
  };

  /**
   * Handle form submission to test API endpoint
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${method} ${endpoint}`);
      }

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-l-4 border-purple-600 pl-4">
      <div
        className={`flex items-center gap-4 mb-3 border-r-4 pr-4 ${getMethodColor(
          method
        )}`}
      >
        <h3 className="text-xl font-semibold text-purple-600">{title}</h3>
        <span
          className={`px-2 py-1 rounded text-sm font-mono ml-auto ${getMethodColor(
            method
          )}`}
        >
          {method}
        </span>
      </div>
      <p className="mb-3">
        <code className="bg-black px-3 py-1 rounded-md text-sm font-mono text-purple-600">
          {endpoint}
        </code>
      </p>
      <p className="text-purple-600 mb-2">Request body:</p>
      <pre className="bg-black p-4 rounded-md font-mono text-sm overflow-x-auto text-purple-600">
        {requestBody}
      </pre>
      <p className="text-purple-600 mt-3 mb-2">Response:</p>
      <pre className="bg-black p-4 rounded-md font-mono text-sm overflow-x-auto text-purple-600">
        {responseBody}
      </pre>

      <div className="mt-6 border-t border-purple-600 pt-4">
        <h4 className="text-lg font-medium text-purple-600 mb-4">Try it out</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          {method === "POST" && endpoint === "/api/shorten" && (
            <>
              <Input
                type="url"
                placeholder="URL to shorten"
                value={formData.url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
                required
              />
              <Input
                type="number"
                placeholder="Max age in seconds (optional)"
                value={formData.maxAge || ""}
                onChange={(e) =>
                  setFormData({ ...formData, maxAge: e.target.value })
                }
                className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
              />
              <Input
                type="text"
                placeholder="Token (optional)"
                value={formData.token || ""}
                onChange={(e) =>
                  setFormData({ ...formData, token: e.target.value })
                }
                className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
              />
            </>
          )}
          {method === "DELETE" && endpoint === "/api/shorten" && (
            <>
              <Input
                type="text"
                placeholder="Comma-separated shortIds"
                value={formData.shortIds || ""}
                onChange={(e) =>
                  setFormData({ ...formData, shortIds: e.target.value })
                }
                className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
                required
              />
              <Input
                type="text"
                placeholder="Token"
                value={formData.token || ""}
                onChange={(e) =>
                  setFormData({ ...formData, token: e.target.value })
                }
                className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
                required
              />
            </>
          )}
          {endpoint === "/api/get-urls" && (
            <Input
              type="text"
              placeholder="Token"
              value={formData.token || ""}
              onChange={(e) =>
                setFormData({ ...formData, token: e.target.value })
              }
              className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
              required
            />
          )}
          {endpoint === "/api/delete-proxy" && (
            <Input
              type="text"
              placeholder="Short ID"
              value={formData.id || ""}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
              required
            />
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="outline"
            className="w-full text-purple-600 hover:bg-purple-600 hover:text-black border-2 border-purple-600"
          >
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </form>

        {error && (
          <div className="mt-4 bg-black border-l-4 border-red-500 p-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {response && (
          <div className="mt-4 bg-black border-l-4 border-purple-600 p-4">
            <p className="text-purple-600 font-medium mb-2">Response:</p>
            <pre className="bg-black p-4 rounded-md font-mono text-sm overflow-x-auto text-purple-600">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * API documentation page component
 * Displays interactive documentation for the URL shortener API endpoints
 */
export default function ApiPage() {
  const hostUrlRef = useRef(getHostUrl());

  const endpoints = [
    {
      title: "1. Shorten URL",
      method: "POST",
      endpoint: "/api/shorten",
      requestBody: `{
  "url": "https://example.com",
  "maxAge": 3600,        // Optional: TTL in seconds
  "token": "hex_token"   // Optional: 64 char hex token for auth
}`,
      responseBody: `{
  "shortId": "abc123xy",
  "fullUrl": "${hostUrlRef.current}/abc123xy",
  "deleteProxyUrl": "${hostUrlRef.current}/delete-proxy?id=abc123xy",
  "expiresAt": "2024-01-01T00:00:00.000Z"  // Only if maxAge provided
}`,
    },
    {
      title: "2. Delete URLs",
      method: "DELETE",
      endpoint: "/api/shorten",
      requestBody: `{
  "shortIds": ["abc123xy", "def456uv"],  // Array of shortIds to delete
  "token": "hex_token"                    // Required: 64 char hex token
}`,
      responseBody: `{
  "results": [
    { "shortId": "abc123xy", "success": true },
    { "shortId": "def456uv", "success": false, "error": "Unauthorized" }
  ]
}`,
    },
    {
      title: "3. Get URLs by Token",
      method: "POST",
      endpoint: "/api/get-urls",
      requestBody: `{
  "token": "hex_token"  // Required: 64 char hex token
}`,
      responseBody: `{
  "urls": [{
    "shortId": "abc123xy",
    "url": "https://example.com",
    "fullUrl": "${hostUrlRef.current}/abc123xy",
    "deleteProxyUrl": "${hostUrlRef.current}/delete-proxy?id=abc123xy",
    "expiresAt": "2024-01-01T00:00:00.000Z"  // Optional
  }]
}`,
    },
    {
      title: "4. Delete Proxy",
      method: "POST",
      endpoint: "/api/delete-proxy",
      requestBody: `{
  "id": "abc123xy"  // shortId to proxy DELETE request for
}`,
      responseBody: `{
  "status": 200,
  "statusText": "OK", 
  "url": "https://example.com",
  "id": "abc123xy"
}`,
    },
    {
      title: "5. Get URL",
      method: "POST", 
      endpoint: "/api/get-url",
      requestBody: `{
  "shortId": "abc123xy",     // Required: shortId to retrieve
  "token": "hex_token"       // Optional: required for private URLs
}`,
      responseBody: `{
  "shortId": "abc123xy",
  "url": "https://example.com",
  "fullUrl": "${hostUrlRef.current}/abc123xy",
  "deleteProxyUrl": "${hostUrlRef.current}/delete-proxy?id=abc123xy",
  "expiresAt": "2024-01-01T00:00:00.000Z"  // Optional
}`,
    }
  ];

  return (
    <>
      <div className="max-w-full mx-auto">
        <h1 className="text-4xl font-extrabold text-purple-600 text-center mb-8">
          veryshort.me API
        </h1>

        <div className="bg-black rounded-lg shadow-lg p-8 mb-8 border-2 border-purple-600">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">
            API Endpoints
          </h2>

          <div className="space-y-8">
            {endpoints.map((endpoint) => (
              <ApiEndpoint key={endpoint.title} {...endpoint} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
