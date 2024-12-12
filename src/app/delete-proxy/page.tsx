"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function DeleteProxyPage() {
  const searchParams = useSearchParams();
  const idFromSearchParams = searchParams.get("id");
  const [id, setId] = useState(idFromSearchParams);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [responseData, setResponseData] = useState<any>(null);

  useEffect(() => {
    if (idFromSearchParams) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFromSearchParams]);

  const handleSubmit = async () => {
    setStatus("loading");

    try {
      const response = await fetch(`/api/delete-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch proxy data");
      }

      const data = await response.json();
      setResponseData(data);
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8 text-white">
          veryshort.me delete proxy
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-3 text-center">
          <p className="text-gray-600">
            This is a proxy that allows you to call the DELETE method for a
            veryshort.me url by using the browser. This can be useful e.g. for
            an AWS signed delete url.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="id"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Enter veryshort.me ID:
              </label>
              <input
                type="text"
                id="id"
                value={id || ""}
                onChange={(e) => setId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter veryshort.me ID"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
            >
              {status === "loading" ? "Sending..." : "Send DELETE request"}
            </Button>
          </form>

          {status === "loading" && (
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {status === "success" && responseData && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-green-700">
                  Status: {responseData.status} {responseData.statusText}
                </p>
              </div>
              <p className="text-gray-600 mt-2">URL: {responseData.url}</p>
              <p className="text-gray-600">ID: {responseData.id}</p>
            </div>
          )}

          {status === "error" && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-red-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="text-red-700">Failed to fetch proxy data</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
};

export default function Page() {
  return (
    <SuspenseWrapper>
      <DeleteProxyPage />
    </SuspenseWrapper>
  );
}
