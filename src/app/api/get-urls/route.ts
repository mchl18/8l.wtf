import { NextResponse } from "next/server";
import { getHostUrl } from "@/lib/utils";
import { createDecipheriv } from "crypto";
import { getDatabase } from "@/lib/adapters";
export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const hostUrl = getHostUrl();
  const db = getDatabase({ type: "kv" });
  const shortIds = await db.smembers(`token:${token}:urls`);
  const urls = [];

  for (const shortId of shortIds) {
    const encryptedUrl = await db.get(shortId);
    const expiresAt = await db.get(`${shortId}:expires`);
    if (encryptedUrl) {
      // Decrypt the URL using the token
      const [urlIvHex, urlEncrypted] = (encryptedUrl as string).split(":");
      const urlIv = Buffer.from(urlIvHex, "hex");
      // Convert hex token to bytes for the key, matching the encryption
      const key = Buffer.from(token, "hex");
      const urlDecipher = createDecipheriv("aes-256-cbc", key, urlIv);
      let decryptedUrl = urlDecipher.update(urlEncrypted, "hex", "utf8");
      decryptedUrl += urlDecipher.final("utf8");

      urls.push({
        shortId,
        url: decryptedUrl,
        fullUrl: `${hostUrl}/${shortId}`,
        deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
        expiresAt: expiresAt
          ? new Date(expiresAt as string).toISOString()
          : undefined,
      });
    }
  }

  return NextResponse.json({ urls });
}
