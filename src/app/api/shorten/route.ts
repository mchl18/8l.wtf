import { getHostUrl } from "@/lib/utils";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { url, maxAge, token } = await request.json();
  const hostUrl = getHostUrl();

  // Separate sets for authenticated and unauthenticated URLs
  const urlsSet = token ? "authenticated_urls" : "anonymous_urls";

  // Only check for existing URLs if no token provided
  if (!token) {
    const existingEntries = await kv.smembers("anonymous_urls");
    for (const entry of existingEntries) {
      const [shortId, storedUrl] = entry.split("::");
      if (storedUrl === url) {
        return NextResponse.json({
          shortId,
          fullUrl: `${hostUrl}/${shortId}`,
          deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
        });
      }
    }
  }

  const shortId = nanoid(8);

  // Store metadata about whether the URL is authenticated
  await kv.set(`url:${shortId}:meta`, { authenticated: !!token });

  // Store the new URL with its short ID in the appropriate set
  await kv.sadd(urlsSet, `${shortId}::${url}`);

  // Store URL with token reference if token provided
  if (token) {
    await kv.sadd(`token:${token}:urls`, shortId);
  }

  // Store the actual URL mapping with optional expiration
  if (maxAge && typeof maxAge === "number") {
    await kv.set(shortId, url, { ex: Math.floor(maxAge) }); // Convert ms to seconds for Redis
  } else {
    await kv.set(shortId, url);
  }

  return NextResponse.json({
    shortId,
    fullUrl: `${hostUrl}/${shortId}`,
    deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
  });
}
