import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { getHostUrl } from "@/lib/utils";

export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const hostUrl = getHostUrl();
  const shortIds = await kv.smembers(`token:${token}:urls`);
  const urls = [];

  for (const shortId of shortIds) {
    const url = await kv.get(shortId);
    if (url) {
      urls.push({
        shortId,
        url,
        fullUrl: `${hostUrl}/${shortId}`,
        deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
      });
    }
  }

  return NextResponse.json({ urls });
}
