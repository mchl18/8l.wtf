import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { url } = await request.json();

  const existingEntries = await kv.smembers("urls");
  for (const entry of existingEntries) {
    const [shortId, storedUrl] = entry.split("::");
    if (storedUrl === url) {
      return NextResponse.json({
        shortId,
        fullUrl: `https://veryshort.me/${shortId}`,
        deleteProxyUrl: `https://veryshort.me/api/delete-proxy/${shortId}`,
      });
    }
  }

  const shortId = nanoid(8);

  // Store the new URL with its short ID
  await kv.sadd("urls", `${shortId}::${url}`);
  await kv.set(shortId, url);
  return NextResponse.json({
    shortId,
    fullUrl: `https://veryshort.me/${shortId}`,
    deleteProxyUrl: `https://veryshort.me/api/delete-proxy/${shortId}`,
  });
}
