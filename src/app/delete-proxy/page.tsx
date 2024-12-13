"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { HomeIcon } from "lucide-react";

function DeleteProxyPage() {
  const searchParams = useSearchParams();
  const idFromSearchParams = searchParams.get("id");
  const [id, setId] = useState(idFromSearchParams);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [responseData, setResponseData] = useState<any>(null);

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
      <div className="flex flex-col gap-4">
        <Link className="mt-8" href="/">
          <Button
            variant="outline"
            size="icon"
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
          >
            <HomeIcon className="w-4 h-4" />
          </Button>
        </Link>

        <Card className="bg-black rounded-lg shadow-2xl max-w-md w-full text-center border-2 border-purple-600">
          <CardHeader>
            <CardTitle className="text-purple-600 text-2xl">
              Delete Proxy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <p className="text-purple-600">
                This is a proxy that allows you to call the DELETE method for a
                veryshort.me url by using the browser. This can be useful e.g.
                for an AWS signed delete url.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="flex flex-col gap-4"
              >
                <Input
                  type="text"
                  value={id || ""}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Enter veryshort.me ID"
                  required
                  className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
                />

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
                >
                  {status === "loading" ? "Sending..." : "Send DELETE request"}
                </Button>
              </form>

              {status === "loading" && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              )}

              {status === "success" && responseData && (
                <div className="border-2 border-purple-600 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="h-6 w-6 text-purple-600"
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
                    <p className="text-purple-600">
                      Status: {responseData.status} {responseData.statusText}
                    </p>
                  </div>
                  <p className="text-purple-600 mt-2">
                    URL: {responseData.url}
                  </p>
                  <p className="text-purple-600">ID: {responseData.id}</p>
                </div>
              )}

              {status === "error" && (
                <div className="border-2 border-red-500 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="h-6 w-6 text-red-500"
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
                    <p className="text-red-500">Failed to fetch proxy data</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
