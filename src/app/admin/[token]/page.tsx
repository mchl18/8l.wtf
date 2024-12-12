"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { isValidToken } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, TrashIcon } from "lucide-react";

type ShortenedUrl = {
  shortId: string;
  url: string;
  fullUrl: string;
  createdAt?: string;
};

export default function AdminPage({ params }: { params: { token: string } }) {
  const [token, setToken] = useState(params.token || "");
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/get-urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch URLs");
      }

      const data = await response.json();
      setUrls(data.urls);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch URLs");
      toast.error("Failed to fetch URLs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shortIds: string[]) => {
    if (!confirm("Are you sure you want to delete the selected URLs?")) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch("/api/shorten", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shortIds, token }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete URLs");
      }

      const data = await response.json();

      const successfulDeletions = (
        data.results as { shortId: string; success: boolean; error: string }[]
      )
        .filter((result) => result.success)
        .map((result) => result.shortId);

      if (successfulDeletions.length > 0) {
        toast.success(
          `Successfully deleted ${successfulDeletions.length} URLs`
        );
        setUrls(
          urls.filter((url) => !successfulDeletions.includes(url.shortId))
        );
        setSelectedUrls(new Set());
      }

      const failures = data.results.filter(
        (result: { success: boolean; error: string }) => !result.success
      );
      if (failures.length > 0) {
        failures.forEach((failure: { shortId: string; error: string }) => {
          toast.error(
            `Failed to delete URL ${failure.shortId}: ${failure.error}`
          );
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete URLs");
    } finally {
      setDeleting(false);
    }
  };

  const toggleUrlSelection = (shortId: string) => {
    const newSelection = new Set(selectedUrls);
    if (newSelection.has(shortId)) {
      newSelection.delete(shortId);
    } else {
      newSelection.add(shortId);
    }
    setSelectedUrls(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedUrls.size === urls.length) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(urls.map((url) => url.shortId)));
    }
  };

  useEffect(() => {
    if (!token) {
      setError("");
      setSelectedUrls(new Set());
      setUrls([]);
      return;
    }
    if (!isValidToken(token)) {
      setError("Invalid token format");
      setSelectedUrls(new Set());
      setUrls([]);
      return;
    }

    fetchUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Card className="bg-black rounded-lg shadow-2xl max-w-4xl w-full text-center mt-24 border-2 border-purple-600 mx-auto">
      <CardHeader>
        <CardTitle className="text-purple-600 text-2xl">
          URL Management Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex gap-2">
            <Input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your token"
              className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
            />
            <Button
              onClick={fetchUrls}
              disabled={loading}
              variant="outline"
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
            >
              {loading ? "Loading..." : "Fetch URLs"}
            </Button>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {urls.length > 0 && (
            <div className="border-2 border-purple-600 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-purple-600 text-xl">Your Shortened URLs</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={toggleSelectAll}
                    variant="outline"
                    className="border-2 border-purple-600 text-purple-600"
                  >
                    {selectedUrls.size === urls.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                  {selectedUrls.size > 0 && (
                    <Button
                      onClick={() => handleDelete(Array.from(selectedUrls))}
                      disabled={deleting}
                      variant="destructive"
                      size="icon"
                    >
                      {deleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {urls.map((url) => (
                  <div
                    key={url.shortId}
                    className="grid grid-cols-[auto,1fr,auto] gap-4 items-center border-b border-purple-600 last:border-b-0 pb-4"
                  >
                    <Checkbox
                      id={`checkbox-${url.shortId}`}
                      checked={selectedUrls.has(url.shortId)}
                      onCheckedChange={() => toggleUrlSelection(url.shortId)}
                      className="border-2 border-purple-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <div className="text-left">
                      <p className="text-purple-600">
                        <span className="font-bold">Short URL:</span>{" "}
                        <a
                          href={url.fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-purple-400"
                        >
                          {url.fullUrl}
                        </a>
                      </p>
                      <p className="text-purple-600">
                        <span className="font-bold">Original URL:</span>{" "}
                        <span className="break-all">{url.url}</span>
                      </p>
                      {url.createdAt && (
                        <p className="text-purple-600">
                          <span className="font-bold">Created:</span>{" "}
                          {new Date(url.createdAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleDelete([url.shortId])}
                      disabled={deleting}
                      variant="destructive"
                      size="icon"
                    >
                      {deleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <TrashIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
