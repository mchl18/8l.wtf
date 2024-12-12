import { getHostUrl } from "@/lib/utils";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { url, maxAge } = await request.json();
  const hostUrl = getHostUrl();
  const existingEntries = await kv.smembers("urls");
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

  const shortId = nanoid(8);

  // Store the new URL with its short ID
  await kv.sadd("urls", `${shortId}::${url}`);
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
