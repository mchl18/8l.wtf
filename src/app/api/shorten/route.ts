import { getHostUrl, isValidToken } from "@/lib/utils";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

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
        const expiresAt = await kv.get(`${shortId}:expires`);
        return NextResponse.json({
          shortId,
          fullUrl: `${hostUrl}/${shortId}`,
          deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
          expiresAt: expiresAt
            ? new Date(expiresAt as string).toISOString()
            : undefined,
        });
      }
    }
  }

  if (token && !isValidToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const originalShortId = nanoid(8);
  let shortId = originalShortId;

  // For authenticated URLs, encrypt both URL and shortId with the token as key
  let storedUrl = url;
  if (token) {
    // Convert hex token to bytes for the key
    const key = Buffer.from(token, "hex");

    // Encrypt URL
    const urlIv = randomBytes(16);
    const urlCipher = createCipheriv("aes-256-cbc", key, urlIv);
    let encryptedUrl = urlCipher.update(url, "utf8", "hex");
    encryptedUrl += urlCipher.final("hex");
    storedUrl = `${urlIv.toString("hex")}:${encryptedUrl}`;
  }

  // Store metadata about whether the URL is authenticated
  await kv.set(`url:${originalShortId}:meta`, { authenticated: !!token });

  // Store the new URL with its short ID in the appropriate set
  await kv.sadd(urlsSet, `${originalShortId}::${storedUrl}`);

  // Store URL with token reference if token provided
  if (token) {
    await kv.sadd(`token:${token}:urls`, originalShortId);
  }

  let expiresAt;
  // Store the actual URL mapping with optional expiration
  if (maxAge && typeof maxAge === "number") {
    expiresAt = new Date(Date.now() + maxAge).toISOString();
    console.log({
      originalShortId,
      storedUrl,
      maxAge,
      expiresAt,
    });
    await kv.set(originalShortId, storedUrl, { ex: Math.floor(maxAge / 1000) }); // Convert ms to seconds for Redis
    await kv.set(`${originalShortId}:expires`, expiresAt);
  } else {
    await kv.set(originalShortId, storedUrl);
  }
  console.log({
    originalShortId,
    storedUrl,
    maxAge,
    expiresAt,
  });
  return NextResponse.json({
    shortId,
    fullUrl: `${hostUrl}/${originalShortId}`,
    deleteProxyUrl: `${hostUrl}/delete-proxy?id=${originalShortId}`,
    expiresAt,
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
    // Check if URL belongs to this token using the tracking set
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
      const storedUrl = await kv.get(shortId);
      if (!storedUrl) {
        results.push({ shortId, success: false, error: "URL not found" });
        continue;
      }

      // Delete from authenticated URLs set
      await kv.srem("authenticated_urls", `${shortId}::${storedUrl}`);

      // Delete metadata
      await kv.del(`url:${shortId}:meta`);
      await kv.del(`${shortId}:expires`);

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
