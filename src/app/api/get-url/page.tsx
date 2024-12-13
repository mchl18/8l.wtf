"use client";
import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const getUrl = async (token: string, shortId: string) => {
  const res = await fetch("/api/get-url", {
    method: "POST",
    body: JSON.stringify({ token, shortId }),
  });
  return await res.json();
};

export default function RedirectPage({
  params,
}: {
  params: { shortId: string };
}) {
  const { shortId } = params;
  const [error, setError] = useState<string>("");
  const [countdown, setCountdown] = useState(3);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const start = startTime || Date.now();
        setStartTime(start);
        const storedToken = localStorage.getItem("shortener_token");
        if (!storedToken) {
          setError("No token found");
          return;
        }
        const url = await getUrl(storedToken, shortId);
        if (url) {
          const timer = setInterval(() => {
            const elapsed = Date.now() - start;
            const remainingSeconds = Math.ceil((3000 - elapsed) / 1000);

            if (elapsed >= 3000) {
              clearInterval(timer);
              window.location.href = url.url;
              return;
            }

            setCountdown(remainingSeconds);
          }, 100);

          return () => clearInterval(timer);
        } else {
          setError("URL not found");
        }
      } catch (e) {
        setError("Error getting token");
      }
    })();
  }, [startTime, shortId]);

  return (
    <>
      <h1 className="text-purple-600 text-2xl mt-24">veryshort.me</h1>
      <Card className="bg-black rounded-lg shadow-2xl max-w-md w-full text-center mt-6 border-2 border-purple-600">
        <CardContent className="pt-6">
          {!error && (
            <div className="flex flex-col gap-3">
              <p className="text-purple-600 text-xl">
                Redirecting in {countdown} seconds...
              </p>
              <p className="text-purple-600">
                Want to create your own short links?
              </p>
              <Link
                href="/"
                className="text-purple-600 ring-1 ring-purple-500 font-medium py-2 px-4 rounded-md shadow transition duration-150"
              >
                Visit veryshort.me
              </Link>
            </div>
          )}

          {error && (
            <div className="border-2 border-purple-600 p-4 rounded-md">
              <p className="text-purple-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
