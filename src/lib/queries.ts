import { ShortenedUrl } from "@/types";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { decrypt, encrypt } from "./crypto";

export const useUrlBySeed = (
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
