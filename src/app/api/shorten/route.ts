import { getHostUrl, validateEncryptedSeedFormat } from "@/lib/utils";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/adapters";

export async function POST(request: Request) {
  const { url, maxAge, seed } = await request.json();
  const hostUrl = getHostUrl();
  const db = await getDatabase();

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
          isEncrypted: false,
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

  const shortId = nanoid(parseInt(process.env.ID_LENGTH || "8"));
  await db.set(`url:${shortId}:meta`, { authenticated: !!seed });

  await db.sadd(urlsSet, `${shortId}::${url}`);

  if (seed) {
    await db.sadd(`token:${seed}:urls`, shortId);
  }

  let expiresAt;
  if (maxAge && typeof maxAge === "number") {
    expiresAt = new Date(Date.now() + maxAge).toISOString();
    await db.set(shortId, url, { ex: Math.floor(maxAge) });
    await db.set(`${shortId}:expires`, expiresAt);
  } else {
    await db.set(shortId, url);
  }
  return NextResponse.json({
    shortId,
    fullUrl: `${hostUrl}/${shortId}`,
    deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
    isEncrypted: !!seed,
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
  const db = await getDatabase();
  const results = [];

  for (const shortId of shortIds) {
    const isUrlOwnedBySeed = await db.sismember(`token:${seed}:urls`, shortId);

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

      const deletedAt = new Date().toISOString();

      // Update metadata to mark as deleted instead of deleting
      await db.set(`url:${shortId}:meta`, {
        authenticated: true,
        deleted: true,
        deletedAt,
      });

      await db.srem("authenticated_urls", `${shortId}::${storedUrl}`);

      // Keep the token association but mark deletion time
      await db.set(`${shortId}:deleted`, deletedAt);

      results.push({
        shortId,
        success: true,
        fullUrl: "",
        deleteProxyUrl: "",
        deletedAt,
      });
    } catch (error) {
      results.push({ shortId, success: false, error: "Deletion failed" });
    }
  }

  return NextResponse.json({ results });
}
