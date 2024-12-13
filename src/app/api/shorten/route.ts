import {
  getHostUrl,
  isValidToken,
  validateEncryptedSeedFormat,
} from "@/lib/utils";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { createCipheriv, randomBytes } from "crypto";
import { getDatabase } from "@/lib/adapters";

export async function POST(request: Request) {
  const { url, maxAge, token, seed } = await request.json();
  const hostUrl = getHostUrl();
  const db = getDatabase();

  const urlsSet = seed ? "authenticated_urls" : "anonymous_urls";

  if (!seed) {
    const existingEntries = await db.smembers("anonymous_urls");
    for (const entry of existingEntries) {
      const [shortId, storedUrl] = entry.split("::");
      if (storedUrl === url) {
        const expiresAt = await db.get(`${shortId}:expires`);
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

  if (seed && !validateEncryptedSeedFormat(seed)) {
    return NextResponse.json({ error: "Invalid seed" }, { status: 401 });
  }

  const originalShortId = nanoid(8);
  let shortId = originalShortId;

  let storedUrl = url;
  await db.set(`url:${originalShortId}:meta`, { authenticated: !!seed });

  await db.sadd(urlsSet, `${originalShortId}::${storedUrl}`);

  if (seed) {
    await db.sadd(`token:${seed}:urls`, originalShortId);
  }

  let expiresAt;
  if (maxAge && typeof maxAge === "number") {
    expiresAt = new Date(Date.now() + maxAge).toISOString();
    await db.set(originalShortId, storedUrl, { ex: Math.floor(maxAge) });
    await db.set(`${originalShortId}:expires`, expiresAt);
  } else {
    await db.set(originalShortId, storedUrl);
  }
  return NextResponse.json({
    shortId,
    fullUrl: `${hostUrl}/${originalShortId}`,
    deleteProxyUrl: `${hostUrl}/delete-proxy?id=${originalShortId}`,
    expiresAt,
  });
}

export async function DELETE(request: Request) {
  const { shortIds, seed } = await request.json();

  if (!validateEncryptedSeedFormat(seed) && !seed) {
    return NextResponse.json({ error: "Invalid seed" }, { status: 401 });
  }

  if (!Array.isArray(shortIds) || shortIds.length === 0) {
    return NextResponse.json(
      { error: "shortIds must be a non-empty array" },
      { status: 400 }
    );
  }
  const db = getDatabase();
  const results = [];

  for (const shortId of shortIds) {
    const isUrlOwnedBySeed = await db.sismember(
      `token:${seed}:urls`,
      shortId
    );

    if (!isUrlOwnedBySeed) {
      results.push({ shortId, success: false, error: "Unauthorized" });
      continue;
    }

    try {
      const storedUrl = await db.get(shortId);
      if (!storedUrl) {
        results.push({ shortId, success: false, error: "URL not found" });
        continue;
      }

      await db.srem("authenticated_urls", `${shortId}::${storedUrl}`);

      await db.del(`url:${shortId}:meta`);
      await db.del(`${shortId}:expires`);

      await db.srem(`token:${seed}:urls`, shortId);

      await db.del(shortId);

      results.push({ shortId, success: true });
    } catch (error) {
      results.push({ shortId, success: false, error: "Deletion failed" });
    }
  }

  return NextResponse.json({ results });
}
