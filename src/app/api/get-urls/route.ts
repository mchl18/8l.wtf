import { NextResponse } from "next/server";
import { getHostUrl } from "@/lib/utils";
import { getDatabase } from "@/lib/adapters";
export async function POST(request: Request) {
  const { seed } = await request.json();

  if (!seed) {
    return NextResponse.json({ error: "Seed is required" }, { status: 400 });
  }

  const hostUrl = getHostUrl();
  const db = getDatabase();
  const shortIds = await db.smembers(`token:${seed}:urls`);
  const urls = [];
  for (const shortId of shortIds) {
    const encryptedUrl = await db.get(shortId);
    const expiresAt = await db.get(`${shortId}:expires`);
    urls.push({
      shortId,
      url: encryptedUrl,
      fullUrl: `${hostUrl}/${shortId}`,
      deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
      isEncrypted: true,
      expiresAt: expiresAt
        ? new Date(expiresAt as string).toISOString()
        : undefined,
    });
  }

  return NextResponse.json({ urls });
}
