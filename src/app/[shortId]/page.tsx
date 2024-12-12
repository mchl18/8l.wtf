"use client";
import { useEffect } from "react";
import { useState } from "react";

const getUrl = async (token: string, shortId: string) => {
  const res = await fetch("/api/get-urls", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  return (await res.json()).urls.find(
    (url: { shortId: string }) => url.shortId === shortId
  );
};

export default function RedirectPage({
  params,
}: {
  params: { shortId: string };
}) {
  const { shortId } = params;
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const storedToken = localStorage.getItem("shortener_token");
        if (!storedToken) {
          setError("No token found");
          return;
        }
        const url = await getUrl(storedToken, shortId);
        if (url) {
          window.location.href = url.url;
        } else {
          setError("URL not found");
        }
      } catch (e) {
        setError("Error getting token");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      {loading && <p>Loading...</p>}
      {!loading && !error && <p>Redirecting...</p>}
      {error && <p>{error}</p>}
    </>
  );
}
