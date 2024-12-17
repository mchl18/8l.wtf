import { NextResponse } from "next/server";
import { getHostUrl } from "@/lib/utils";
import { getDatabase } from "@/lib/adapters";
export async function POST(request: Request) {
  const { seed } = await request.json();

  if (!seed) {
    return NextResponse.json({ error: "Seed is required" }, { status: 400 });
  }

  const hostUrl = getHostUrl();
  const db = await getDatabase();
  const shortIds = await db.smembers(`token:${seed}:urls`);
  const urls = [];

  for (const shortId of shortIds) {
    // Check if URL is marked as deleted
    const metadata = await db.get<{ deleted: boolean }>(`url:${shortId}:meta`);
    const isDeleted =
      metadata && typeof metadata === "object" && metadata.deleted === true;

    if (!isDeleted) {
      const encryptedUrl = await db.get(shortId);
      const expiresAt = await db.get(`${shortId}:expires`);

      // Only add URL if it exists (not deleted)
      if (encryptedUrl) {
        urls.push({
          shortId,
          url: encryptedUrl,
          fullUrl: `${hostUrl}?q=${shortId}`,
          deleteProxyUrl: `${hostUrl}/delete-proxy?q=${shortId}`,
          isEncrypted: true,
          expiresAt: expiresAt
            ? new Date(expiresAt as string).toISOString()
            : undefined,
        });
      }
    }
  }

  return NextResponse.json({ urls });
}
