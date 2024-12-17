"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useReducer } from "react";
import { isValidToken, copyToClipboard, cleanUrl } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  TrashIcon,
  LinkIcon,
  HomeIcon,
  LockIcon,
  QrCodeIcon,
} from "lucide-react";
import Link from "next/link";
import { SEED, encrypt } from "@/lib/crypto";
import QRCode from "qrcode";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteUrls, useUrlsBySeed } from "@/lib/queries";

const UrlSkeleton = () => (
  <div className="grid grid-cols-[auto,1fr,auto] gap-2 sm:gap-4 items-center border-b border-purple-600 last:border-b-0 pb-4">
    <Skeleton className="h-4 w-4 rounded" />
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32 sm:w-48" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-48 sm:w-64" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32 sm:w-40" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-32 sm:w-40" />
      </div>
    </div>
    <Skeleton className="h-8 w-8 rounded" />
  </div>
);

type State = {
  token: string;
  seed: string;
  deleting: boolean;
  selectedUrls: Set<string>;
};

type Action =
  | { type: "SET_TOKEN"; payload: string }
  | { type: "SET_SEED"; payload: string }
  | { type: "SET_DELETING"; payload: boolean }
  | { type: "SET_SELECTED_URLS"; payload: Set<string> }
  | { type: "TOGGLE_URL"; payload: string }
  | { type: "TOGGLE_ALL"; payload: string[] }
  | { type: "CLEAR_SELECTED" };

const initialState: State = {
  token: "",
  seed: "",
  deleting: false,
  selectedUrls: new Set(),
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "SET_SEED":
      return { ...state, seed: action.payload };
    case "SET_DELETING":
      return { ...state, deleting: action.payload };
    case "SET_SELECTED_URLS":
      return { ...state, selectedUrls: action.payload };
    case "TOGGLE_URL": {
      const newSelection = new Set(state.selectedUrls);
      if (newSelection.has(action.payload)) {
        newSelection.delete(action.payload);
      } else {
        newSelection.add(action.payload);
      }
      return { ...state, selectedUrls: newSelection };
    }
    case "TOGGLE_ALL": {
      const newSelection =
        state.selectedUrls.size === action.payload.length
          ? new Set<string>()
          : new Set(action.payload);
      return { ...state, selectedUrls: newSelection };
    }
    case "CLEAR_SELECTED":
      return { ...state, selectedUrls: new Set() };
    default:
      return state;
  }
}

export default function AdminPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    data: urls = [],
    isLoading,
    error,
    isPending,
    refetch,
    isSuccess,
  } = useUrlsBySeed(state.seed, state.token);

  const {
    mutate: deleteUrls,
    data: deleteData,
    isPending: isDeleting,
  } = useDeleteUrls(state.seed);

  useEffect(() => {
    const token = localStorage.getItem("8lwtf_token");
    if (token) {
      dispatch({ type: "SET_TOKEN", payload: token });
    }
  }, []);

  const generateQRCode = async (url: string, isEncrypted: boolean) => {
    try {
      const finalUrl = isEncrypted ? `${url}?token=${state.token}` : url;
      const qrDataUrl = await QRCode.toDataURL(finalUrl);

      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `8l.wtf QR Code - ${new Date().toISOString()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("QR Code downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR code");
    }
  };

  const handleDelete = async (shortIds: string[]) => {
    if (!confirm("Are you sure you want to delete the selected URLs?")) {
      return;
    }

    try {
      dispatch({ type: "SET_DELETING", payload: true });
      deleteUrls(shortIds);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete URLs");
    } finally {
      dispatch({ type: "SET_DELETING", payload: false });
    }
  };

  useEffect(() => {
    if (!deleteData) return;
    const successfulDeletions = (
      deleteData.results as {
        shortId: string;
        success: boolean;
        error: string;
      }[]
    )
      .filter((result) => result.success)
      .map((result) => result.shortId);

    if (successfulDeletions.length > 0) {
      toast.success(`Successfully deleted ${successfulDeletions.length} URLs`);
      dispatch({ type: "CLEAR_SELECTED" });
    }

    const failures = deleteData.results.filter((result) => !result.success);
    if (failures && failures.length > 0) {
      failures.forEach((failure) => {
        toast.error(
          `Failed to delete URL ${failure.shortId}: ${failure.error}`
        );
      });
    }
    refetch();
  }, [deleteData, refetch]);

  useEffect(() => {
    if (!state.token) {
      dispatch({ type: "CLEAR_SELECTED" });
      return;
    }
    if (!isValidToken(state.token)) {
      dispatch({ type: "CLEAR_SELECTED" });
      return;
    }
    const encryptedSeed = encrypt(SEED, state.token);
    dispatch({ type: "SET_SEED", payload: encryptedSeed });
  }, [state.token]);

  return (
    <>
      <div className="flex flex-col gap-4 px-4 sm:px-6 md:px-8">
        <Link className="mt-8" href={`/`}>
          <Button
            variant="outline"
            size="icon"
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
          >
            <HomeIcon className="w-4 h-4" />
          </Button>
        </Link>
        <Card className="bg-black rounded-lg shadow-2xl w-full text-center border-2 border-purple-600 mx-auto">
          <CardHeader>
            <CardTitle className="text-purple-600 text-xl sm:text-2xl">
              URL Management Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  value={state.token}
                  onChange={(e) => dispatch({ type: "SET_TOKEN", payload: e.target.value })}
                  placeholder="Enter your token"
                  className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
                />
                <Button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black whitespace-nowrap"
                >
                  {isLoading ? "Loading..." : "Fetch URLs"}
                </Button>
              </div>

              {error && <p className="text-red-500">{error.message}</p>}

              {(urls?.length > 0 || isLoading || state.token) && (
                <div className="border-2 border-purple-600 rounded-lg p-2 sm:p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                    <h3 className="text-purple-600 text-lg sm:text-xl">
                      Your Shortened URLs
                    </h3>
                    {!isLoading && urls?.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => dispatch({ type: "TOGGLE_ALL", payload: urls.map(url => url.shortId) })}
                          variant="outline"
                          className="border-2 border-purple-600 text-purple-600 text-sm sm:text-base"
                        >
                          {state.selectedUrls.size === urls?.length
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                        {state.selectedUrls.size > 0 && (
                          <Button
                            onClick={() =>
                              handleDelete(Array.from(state.selectedUrls))
                            }
                            disabled={state.deleting}
                            variant="destructive"
                            size="icon"
                          >
                            {state.deleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <TrashIcon className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {isLoading || isPending || !state.seed || isDeleting
                      ? Array(5)
                          .fill(0)
                          .map((_, i) => <UrlSkeleton key={i} />)
                      : urls.map((url) => (
                          <div
                            key={url.shortId}
                            className="grid grid-cols-[auto,1fr,auto] gap-2 sm:gap-4 items-start border-b border-purple-600 last:border-b-0 pb-4"
                          >
                            <Checkbox
                              id={`checkbox-${url.shortId}`}
                              checked={state.selectedUrls.has(url.shortId)}
                              onCheckedChange={() =>
                                dispatch({ type: "TOGGLE_URL", payload: url.shortId })
                              }
                              className="border-2 border-purple-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 mt-1"
                            />
                            <div className="text-left space-y-2">
                              <p className="text-purple-600 flex flex-wrap items-center gap-2 text-sm sm:text-base">
                                <span className="font-bold">Original URL:</span>{" "}
                                {isPending ? (
                                  <Skeleton className="h-4 w-64" />
                                ) : (
                                  <span className="break-all">
                                    {cleanUrl(url.url)}
                                  </span>
                                )}
                                {url.isEncrypted && (
                                  <LockIcon className="w-4 h-4 text-purple-600" />
                                )}
                                <Button
                                  onClick={() => copyToClipboard(url.url)}
                                  variant="ghost"
                                  size="icon"
                                  className="text-purple-600 hover:text-purple-400"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                </Button>
                              </p>
                              <p className="text-purple-600 flex flex-wrap items-center gap-2 text-sm sm:text-base">
                                <span className="font-bold">Short URL:</span>{" "}
                                {isPending ? (
                                  <Skeleton className="h-4 w-48" />
                                ) : (
                                  <a
                                    href={url.fullUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-purple-400 break-all"
                                  >
                                    {cleanUrl(url.fullUrl)}
                                  </a>
                                )}
                                {url.isEncrypted && (
                                  <LockIcon className="w-4 h-4 text-purple-600" />
                                )}
                                <Button
                                  onClick={() => copyToClipboard(url.fullUrl)}
                                  variant="ghost"
                                  size="icon"
                                  className="text-purple-600 hover:text-purple-400"
                                >
                                  <LinkIcon className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() =>
                                    generateQRCode(
                                      url.fullUrl,
                                      !!url.isEncrypted
                                    )
                                  }
                                  variant="ghost"
                                  size="icon"
                                  className="text-purple-600 hover:text-purple-400"
                                >
                                  <QrCodeIcon className="w-4 h-4" />
                                </Button>
                              </p>

                              {state.token && (
                                <div className="text-sm sm:text-base">
                                  <p className="text-purple-600 flex flex-wrap items-center gap-2">
                                    <span className="font-bold">
                                      Invite URL:
                                    </span>
                                    <a
                                      href={`/?token=${state.token}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:text-purple-400 break-all"
                                    >
                                      {cleanUrl(
                                        `${url.fullUrl}/?token=${state.token}`
                                      )}
                                    </a>
                                    <Button
                                      onClick={() =>
                                        copyToClipboard(
                                          `${url.fullUrl}/?token=${state.token}`
                                        )
                                      }
                                      variant="ghost"
                                      size="icon"
                                      className="text-purple-600 hover:text-purple-400"
                                    >
                                      <LinkIcon className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        generateQRCode(
                                          `${url.fullUrl}/?token=${state.token}`,
                                          false
                                        )
                                      }
                                      variant="ghost"
                                      size="icon"
                                      className="text-purple-600 hover:text-purple-400"
                                    >
                                      <QrCodeIcon className="w-4 h-4" />
                                    </Button>
                                  </p>
                                </div>
                              )}
                              {url.createdAt && (
                                <p className="text-purple-600 text-sm sm:text-base">
                                  <span className="font-bold">Created:</span>{" "}
                                  {new Date(url.createdAt).toLocaleString()}
                                </p>
                              )}
                              {url.expiresAt && (
                                <p className="text-purple-600 text-sm sm:text-base">
                                  <span className="font-bold">Expires:</span>{" "}
                                  {new Date(url.expiresAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <Button
                              onClick={() => handleDelete([url.shortId])}
                              disabled={state.deleting}
                              variant="destructive"
                              size="icon"
                              className="mt-1"
                            >
                              {state.deleting ? (
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
              {isSuccess && !error && !urls?.length && (
                <p className="text-purple-600">No URLs found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
