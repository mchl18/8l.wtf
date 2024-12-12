"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useCallback, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CopyIcon, DeleteIcon, RefreshCcwIcon, TrashIcon } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [maxAge, setMaxAge] = useState<number | string>(0);
  const [presetValue, setPresetValue] = useState("");
  const [error, setError] = useState("");
  const [selectedMode, setSelectedMode] = useState<
    "forever" | "custom" | "preset"
  >("forever");
  const [token, setToken] = useState("");

  const presets = [
    { label: "1 hour", value: 3600 },
    { label: "1 day", value: 86400 },
    { label: "1 week", value: 604800 },
    { label: "1 month", value: 2592000 },
  ];
  console.log(selectedMode, maxAge);

  const fetchToken = async () => {
    const response = await fetch("/api/token");
    const data = await response.json();
    setToken(data.token);
    copyToken(data.token);
  };

  const copyToken = async (token: string) => {
    await navigator.clipboard.writeText(token);
    toast.success("Token copied to clipboard!");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const opts: Record<string, number | string> = {
        url,
        maxAge:
          selectedMode === "forever"
            ? 0
            : selectedMode === "custom"
            ? maxAge
            : presetValue,
      };
      if (token) {
        opts.token = token;
      }
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(opts),
      });
      const data = await response.json();
      if (data.fullUrl) {
        setShortUrl(`${data.fullUrl}`);
      }
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
      <Card className="bg-black rounded-lg shadow-2xl max-w-md w-full text-center mt-24 border-2 border-purple-600">
        <CardHeader>
          <CardTitle className="text-purple-600 text-2xl">
            veryshort.me
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  <Input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    readOnly={true}
                    placeholder="Custom token (optional)"
                    className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
                  />
                  {token && (
                    <Button
                      type="button"
                      size={"icon"}
                      variant="outline"
                      onClick={() => setToken("")}
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
                      onClick={() => copyToken(token)}
                      className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size={"icon"}
                    onClick={fetchToken}
                    className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
                  >
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
                Shorten
              </Button>
              {error && <p className="text-red-500">{error}</p>}
              {shortUrl && (
                <div className="bg-transparent rounded-lg p-4 border-2 border-purple-600">
                  <p className="text-purple-600 mb-2">Shortened URL:</p>
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
    </>
  );
}
