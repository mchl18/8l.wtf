import { ShortenedUrl } from "@/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { decrypt } from "./crypto";

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
