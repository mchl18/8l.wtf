import { getHostUrl, isValidToken } from "@/lib/utils";
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

  if (token && !isValidToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
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

export async function DELETE(request: Request) {
  const { shortIds, token } = await request.json();

  if (!isValidToken(token) && !token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!Array.isArray(shortIds) || shortIds.length === 0) {
    return NextResponse.json(
      { error: "shortIds must be a non-empty array" },
      { status: 400 }
    );
  }

  const results = [];

  for (const shortId of shortIds) {
    // Check if URL belongs to this token
    const isUrlOwnedByToken = await kv.sismember(
      `token:${token}:urls`,
      shortId
    );

    if (!isUrlOwnedByToken) {
      results.push({ shortId, success: false, error: "Unauthorized" });
      continue;
    }

    try {
      // Get URL to determine which set it's in
      const url = await kv.get(shortId);
      if (!url) {
        results.push({ shortId, success: false, error: "URL not found" });
        continue;
      }

      // Delete from authenticated URLs set
      await kv.srem("authenticated_urls", `${shortId}::${url}`);

      // Delete metadata
      await kv.del(`url:${shortId}:meta`);

      // Remove from token's URL set
      await kv.srem(`token:${token}:urls`, shortId);

      // Delete the URL mapping
      await kv.del(shortId);

      results.push({ shortId, success: true });
    } catch (error) {
      results.push({ shortId, success: false, error: "Deletion failed" });
    }
  }

  return NextResponse.json({ results });
}
