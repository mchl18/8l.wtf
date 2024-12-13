import { getHostUrl, isValidToken } from "@/lib/utils";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { createCipheriv, randomBytes } from "crypto";
import { createKvAdapter } from "@/lib/adapters/kv-adapter";

export async function POST(request: Request) {
  const { url, maxAge, token } = await request.json();
  const hostUrl = getHostUrl();
  const db = createKvAdapter();

  const urlsSet = token ? "authenticated_urls" : "anonymous_urls";

  if (!token) {
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

  if (token && !isValidToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const originalShortId = nanoid(8);
  let shortId = originalShortId;

  let storedUrl = url;
  if (token) {
    const key = Buffer.from(token, "hex");

    const urlIv = randomBytes(16);
    const urlCipher = createCipheriv("aes-256-cbc", key, urlIv);
    let encryptedUrl = urlCipher.update(url, "utf8", "hex");
    encryptedUrl += urlCipher.final("hex");
    storedUrl = `${urlIv.toString("hex")}:${encryptedUrl}`;
  }

  await db.set(`url:${originalShortId}:meta`, { authenticated: !!token });

  await db.sadd(urlsSet, `${originalShortId}::${storedUrl}`);

  if (token) {
    await db.sadd(`token:${token}:urls`, originalShortId);
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
  const db = createKvAdapter();
  const results = [];

  for (const shortId of shortIds) {
    const isUrlOwnedByToken = await db.sismember(
      `token:${token}:urls`,
      shortId
    );

    if (!isUrlOwnedByToken) {
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

      await db.srem(`token:${token}:urls`, shortId);

      await db.del(shortId);

      results.push({ shortId, success: true });
    } catch (error) {
      results.push({ shortId, success: false, error: "Deletion failed" });
    }
  }

  return NextResponse.json({ results });
}
