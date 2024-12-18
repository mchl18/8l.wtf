import { ShortenedUrl } from "@/types";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { decrypt, encrypt } from "./crypto";
import QRCode from "qrcode";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useQrCode = (
  text: string,
  options: QRCode.QRCodeToDataURLOptions = {
    width: 300,
    margin: 2,
  }
): UseQueryResult<string, Error> => {
  return useQuery({
    queryKey: ["qr", text],
    queryFn: async () => {
      return await QRCode.toDataURL(text, options);
    },
    enabled: !!text,
  });
};

export const useUrlBySeed = (
  shortId: string,
  seed?: string
): UseQueryResult<ShortenedUrl, Error> => {
  return useQuery({
    queryKey: ["url", seed, shortId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/get-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      const response = await fetch(`${API_URL}/api/get-urls`, {
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
        url: url.isEncrypted ? decrypt(url.url, token) : url.url,
      }));
    },
    enabled: !!seed,
  });
};

export const useShortenUrl = (
  url: string,
  seed?: string | null,
  maxAge?: number | string,
  isEncrypted?: boolean,
  token?: string
) => {
  return useMutation({
    mutationFn: async () => {
      if (isEncrypted && (!token || !seed)) {
        throw new Error("Seed is required");
      }
      const response = await fetch(`${API_URL}/api/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: isEncrypted && token ? encrypt(url, token) : url,
          isEncrypted: isEncrypted && !!token,
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
      const response = await fetch(`${API_URL}/api/shorten`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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
