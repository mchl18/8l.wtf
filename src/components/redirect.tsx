import { useEffect } from "react";
import { useUrlBySeed } from "@/lib/queries";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { decrypt } from "@/lib/crypto";
import { SEED } from "@/lib/crypto";
import { encrypt } from "@/lib/crypto";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";

const REDIRECT_DELAY = parseInt(
  process.env.NEXT_PUBLIC_REDIRECT_DELAY || "5000"
);

export default function RedirectPage({
  params,
}: {
  params: { shortId: string };
}) {
  const { shortId } = params;
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | undefined>(undefined);
  const [seed, setSeed] = useState<string | undefined>(undefined);
  const [countdown, setCountdown] = useState(REDIRECT_DELAY / 1000);
  const [startTime, setStartTime] = useState(0);
  const { data, error } = useUrlBySeed(shortId, seed);
  const [redirectError, setRedirectError] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    setStartTime(Date.now());
    const storedToken = localStorage.getItem("8lwtf_token");
    if (storedToken) {
      setToken(storedToken);
    }
    const paramsToken = searchParams.get("token");
    if (paramsToken) {
      setToken(paramsToken);
      if (!storedToken) {
        localStorage.setItem("8lwtf_token", paramsToken);
      }
    }

    const finalToken = storedToken || paramsToken || "";
    if (finalToken) {
      setSeed(encrypt(SEED, finalToken));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!startTime) {
      return;
    }
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingSeconds = Math.ceil((REDIRECT_DELAY - elapsed) / 1000);

      if (elapsed >= REDIRECT_DELAY) {
        clearInterval(timer);
        console.log("redirecting to", data);
        if (token && data?.isEncrypted) {
          const decryptedToken = decrypt(data.url, token);
          try {
            window.location.href = decryptedToken;
          } catch (e) {
            console.error(e);
            setRedirectError(`Redirect error: ${(e as Error).message || e}`);
          }
        } else {
          if (!data?.url) {
            return;
          }
          try {
            window.location.href = data.url;
          } catch (e) {
            console.error(e);
            setRedirectError(`Redirect error: ${(e as Error).message || e}`);
          }
        }
        return;
      }

      setCountdown((x) => {
        if (x === remainingSeconds) {
          return x;
        }
        return remainingSeconds;
      });
    }, 333);

    return () => clearInterval(timer);
  }, [startTime, shortId, seed, data, token]);

  return (
    <>
      <h1 className="text-purple-600 text-2xl">8l.wtf</h1>
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
                Visit 8l.wtf
              </Link>
            </div>
          )}

          {error && (
            <div className="border-2 border-purple-600 p-4 rounded-md my-2">
              <p className="text-purple-600">{error.message}</p>
            </div>
          )}
          {redirectError && (
            <div className="border-2 border-purple-600 p-4 rounded-md my-2">
              <p className="text-purple-600">{redirectError}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
