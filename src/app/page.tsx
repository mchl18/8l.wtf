"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CopyIcon, RefreshCcwIcon, TrashIcon } from "lucide-react";
import {
  cleanUrl,
  copyToClipboard,
  generateToken,
  isValidToken,
} from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { SEED, encrypt } from "@/lib/crypto";
import { useShortenUrl } from "@/lib/queries";

function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [maxAge, setMaxAge] = useState<number | string>(0);
  const [presetValue, setPresetValue] = useState("");
  const [error, setError] = useState("");
  const [selectedMode, setSelectedMode] = useState<
    "forever" | "custom" | "preset"
  >("forever");
  const [token, setToken] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [seed, setSeed] = useState<string | null>(null);
  const {
    mutate: shortenUrl,
    data: shortenedUrl,
    isPending,
    isSuccess,
  } = useShortenUrl(url, isPrivate ? seed : null, maxAge, isPrivate, token);

  const presets = [
    { label: "1 hour", value: 3600 },
    { label: "1 day", value: 86400 },
    { label: "1 week", value: 604800 },
    { label: "1 month", value: 2592000 },
  ];

  const makeToken = async () => {
    setError("");
    const token = generateToken();
    setToken(token);
    localStorage.setItem("8lwtf_token", token);
    copyToClipboard(token);
    router.push(`/?token=${token}`);
    const encryptedSeed = encrypt(SEED, token);
    setSeed(encryptedSeed);
  };

  useEffect(() => {
    setUrl(process.env.NEXT_PUBLIC_DEFAULT_URL || "");
    if (searchParams.get("url")) {
      setUrl(searchParams.get("url") || "");
    }

    const queryToken = searchParams.get("token");
    if (queryToken) {
      if (isValidToken(queryToken)) {
        setToken(queryToken);
        localStorage.setItem("8lwtf_token", queryToken);
        const encryptedSeed = encrypt(SEED, queryToken);
        setSeed(encryptedSeed);
      } else {
        setError("Invalid token");
      }
    } else {
      // Try to get token from localStorage if no query param
      const storedToken = localStorage.getItem("8lwtf_token");
      if (storedToken && isValidToken(storedToken)) {
        setToken(storedToken);
        router.push(`/?token=${storedToken}`);
        const encryptedSeed = encrypt(SEED, storedToken);
        setSeed(encryptedSeed);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setError("");
    try {
      e.preventDefault();
      shortenUrl();
    } catch (error) {
      console.error(error);
      setError("Something went wrong");
    }
  };

  const setMode = useCallback(
    (mode: "forever" | "custom" | "preset") => {
      setSelectedMode(mode);
      if (mode === "forever") {
        setMaxAge(0);
      }
    },
    [setSelectedMode, setMaxAge]
  );

  return (
    <>
      <h1 className="text-purple-600 text-2xl mt-24">8l.wtf</h1>
      <p className="text-purple-600 text-center">8 letters is all you need.</p>
      <Card className="bg-black rounded-lg shadow-2xl max-w-md w-full text-center mt-6 border-2 border-purple-600">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL to shorten"
                required
                className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
              />

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  {token && (
                    <Input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      readOnly={true}
                      placeholder="Custom token (optional)"
                      className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
                    />
                  )}
                  {token && (
                    <Button
                      type="button"
                      size={"icon"}
                      variant="outline"
                      onClick={() => {
                        setToken("");
                        setIsPrivate(false);
                        localStorage.removeItem("8lwtf_token");
                      }}
                      className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  )}
                  {token && (
                    <Button
                      type="button"
                      size={"icon"}
                      variant="outline"
                      onClick={() => copyToClipboard(token)}
                      className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size={"icon"}
                    onClick={makeToken}
                    className={`border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black ${
                      !token ? "w-full" : ""
                    }`}
                  >
                    {token ? "" : <span className="mr-2">Generate Token</span>}
                    <RefreshCcwIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex md:flex-row flex-col w-full gap-2 md:gap-1 justify-center md:items-center">
                <Button
                  type="button"
                  variant={"outline"}
                  onClick={() => {
                    setMode("forever");
                    setPresetValue("");
                  }}
                  className={`text-sm flex-1 ${
                    selectedMode === "forever"
                      ? "text-purple-600 bg-purple-600 text-black ring-2 ring-purple-500 active:ring-2 active:ring-purple-500"
                      : "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
                  }`}
                >
                  Forever
                </Button>
                <Select
                  value={`${presetValue || ""}`}
                  onValueChange={(value) => {
                    if (value === "0" || !value) {
                      return;
                    } else {
                      setPresetValue(value);
                      setMode("preset");
                    }
                  }}
                  onOpenChange={(open) => {
                    if (
                      !presets.find(
                        (preset) => preset.value === Number(presetValue)
                      )?.value &&
                      selectedMode !== "custom"
                    ) {
                      setMode("forever");
                    }
                  }}
                >
                  <SelectTrigger
                    className={`md:w-[180px] w-full text-sm hover:text-black ${
                      selectedMode === "preset"
                        ? "text-purple-600 bg-purple-600 text-black ring-2 ring-purple-500 active:ring-2 active:ring-purple-500"
                        : "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
                    }`}
                  >
                    <SelectValue placeholder="Select duration..." />
                  </SelectTrigger>
                  <SelectContent className="text-purple-600">
                    {presets
                      .filter((preset) => preset.value !== 0)
                      .map((preset) => (
                        <SelectItem
                          key={preset.value}
                          value={preset.value.toString()}
                        >
                          {preset.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant={"outline"}
                  onClick={() => {
                    setMode("custom");
                    setPresetValue("");
                    setMaxAge("");
                  }}
                  className={`text-sm flex-1 ${
                    selectedMode === "custom"
                      ? "text-purple-600 bg-purple-600 text-black ring-2 ring-purple-500 active:ring-2 active:ring-purple-500"
                      : "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
                  }`}
                >
                  Custom
                </Button>
              </div>

              {selectedMode === "custom" && (
                <div className="flex items-center gap-2 justify-center">
                  <Input
                    type="number"
                    value={maxAge}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        setMaxAge("");
                        return;
                      }
                      setMaxAge(Number(e.target.value));
                    }}
                    placeholder="Custom expiry (seconds)"
                    className="w-48 text-purple-600 ring-2 ring-purple-500 placeholder:text-purple-400 w-full"
                    min="0"
                  />
                </div>
              )}
              <Button
                type="submit"
                variant="outline"
                className="px-4 py-2 text-purple-600 hover:bg-purple-600 hover:text-black rounded-lg transition-colors focus:outline-none ring-2 ring-purple-500 ring-opacity-50 active:ring-2 active:ring-purple-500"
              >
                Shorten URL
              </Button>

              {error && <p className="text-red-500">{error}</p>}
              {shortenedUrl && isSuccess && (
                <div className="bg-transparent rounded-lg p-4 border-2 border-purple-600">
                  <p className="text-purple-600 mb-2">Shortened URL:</p>
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={shortenedUrl?.fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 break-all"
                    >
                      {cleanUrl(shortenedUrl?.fullUrl || "")}
                    </a>
                    <Button
                      type="button"
                      size={"icon"}
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(cleanUrl(shortenedUrl?.fullUrl || ""))
                      }
                      className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black flex-shrink-0"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              {isPending && (
                <div className="bg-transparent rounded-lg p-4 border-2 border-purple-600">
                  <p className="text-purple-600 mb-2">Shortened URL:</p>
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-10 w-full bg-purple-600/20" />
                  </div>
                </div>
              )}
              <div className="flex flex-row items-center gap-2 justify-between">
                <div
                  className={`flex items-center gap-2 justify-center ${
                    !isValidToken(token) ? "opacity-50" : ""
                  }`}
                >
                  <Checkbox
                    id="private"
                    checked={isPrivate}
                    onCheckedChange={(checked) =>
                      setIsPrivate(checked as boolean)
                    }
                    className="border-purple-600 data-[state=checked]:bg-purple-600"
                  />
                  <label htmlFor="private" className="text-purple-600">
                    Private URL
                  </label>
                </div>
                {isValidToken(token) ? (
                  <Link
                    href={`/admin/${token}`}
                    className="text-purple-600 hover:text-purple-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    My URLs
                  </Link>
                ) : (
                  <span
                    className={` text-purple-600 hover:text-purple-800 ${
                      !isValidToken(token) ? "opacity-50" : ""
                    }`}
                  >
                    My URLs
                  </span>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <Link
        href="/api"
        className="text-purple-600 ring-1 ring-purple-500 font-medium py-2 px-4 rounded-md shadow transition duration-150 mt-4"
      >
        API Documentation
      </Link>
      <Link
        href="/delete-proxy"
        className="text-purple-600 ring-1 ring-purple-500 font-medium py-2 px-4 rounded-md shadow transition duration-150 mt-4"
      >
        Delete Proxy
      </Link>
      <Link
        href="https://github.com/mchl18/8l.wtf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-600 ring-1 ring-purple-500 font-medium py-2 px-4 rounded-md shadow transition duration-150 mt-4"
      >
        GitHub
      </Link>
    </>
  );
}

const LoadingSkeleton = () => {
  return (
    <>
      <h1 className="text-purple-600 text-2xl mt-24">8l.wtf</h1>
      <Card className="bg-black rounded-lg shadow-2xl max-w-md w-full text-center mt-6 border-2 border-purple-600">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full bg-purple-600/20" />
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 bg-purple-600/20" />
                <Skeleton className="h-10 w-10 bg-purple-600/20" />
              </div>
            </div>
            <div className="flex md:flex-row flex-col w-full gap-2 md:gap-1 justify-center md:items-center">
              <Skeleton className="h-10 flex-1 bg-purple-600/20" />
              <Skeleton className="h-10 md:w-[180px] w-full bg-purple-600/20" />
              <Skeleton className="h-10 flex-1 bg-purple-600/20" />
            </div>
            <Skeleton className="h-10 w-full bg-purple-600/20" />
            <div className="flex gap-2 justify-center">
              <Skeleton className="h-10 w-32 bg-purple-600/20" />
              <Skeleton className="h-10 w-32 bg-purple-600/20" />
              <Skeleton className="h-10 w-32 bg-purple-600/20" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-4 mt-4 justify-center">
        <Skeleton className="h-10 w-32 bg-purple-600/20" />
        <Skeleton className="h-10 w-32 bg-purple-600/20" />
        <Skeleton className="h-10 w-32 bg-purple-600/20" />
      </div>
    </>
  );
};

const SupsenseWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>;
};

export default function Page() {
  return (
    <SupsenseWrapper>
      <Home />
    </SupsenseWrapper>
  );
}
