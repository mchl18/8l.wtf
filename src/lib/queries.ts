import { ShortenedUrl } from "@/types";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { decrypt, encrypt } from "./crypto";
import QRCode from "qrcode";

export const useQrCode = (
  text: string,
  options: QRCode.QRCodeToDataURLOptions
): UseQueryResult<string, Error> => {
  return useQuery({
    queryKey: ["qr", text],
    queryFn: async () => {
      return await QRCode.toDataURL(text, options);
    },
  });
};
export const useUrlBySeed = (
  shortId: string,
  seed?: string
): UseQueryResult<ShortenedUrl, Error> => {
  return useQuery({
    queryKey: ["url", seed, shortId],
    queryFn: async () => {
      const res = await fetch("/api/get-url", {
        method: "POST",
        body: JSON.stringify({ seed, shortId }),
      });
      return (await res.json()) as ShortenedUrl;
    },
  });
};

export const useUrlsBySeed = (
  seed: string,
  token: string
): UseQueryResult<ShortenedUrl[], Error> => {
  return useQuery({
    queryKey: ["url", seed],
    queryFn: async () => {
      const response = await fetch("/api/get-urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seed }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch URLs");
      }

      const json = await response.json();
      return json.urls.map((url: ShortenedUrl) => ({
        ...url,
        url: decrypt(url.url, token),
      }));
    },
    enabled: !!seed,
  });
};

export const useShortenUrl = (
  url: string,
  seed?: string | null,
  maxAge?: number | string,
  isPrivate?: boolean,
  token?: string
) => {
  return useMutation({
    mutationFn: async () => {
      if (isPrivate && (!token || !seed)) {
        throw new Error("Seed is required");
      }
      const response = await fetch("/api/shorten", {
        method: "POST",
        body: JSON.stringify({
          url: isPrivate && token ? encrypt(url, token) : url,
          seed,
          maxAge: maxAge ? parseInt(maxAge as string) : 0,
        }),
      });
      const data = await response.json();
      return data as ShortenedUrl;
    },
  });
};

export const useDeleteUrls = (seed: string) => {
  return useMutation({
    mutationFn: async (shortIds: string[]) => {
      const response = await fetch("/api/shorten", {
        method: "DELETE",
        body: JSON.stringify({ shortIds, seed }),
      });
      return (await response.json()) as {
        results: {
          shortId: string;
          success: boolean;
          error?: string;
        }[];
      };
    },
  });
};
