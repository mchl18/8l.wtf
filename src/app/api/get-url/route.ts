import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { getHostUrl } from "@/lib/utils";
import { createDecipheriv } from "crypto";

export async function POST(request: Request) {
  const { token, shortId } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  if (!shortId) {
    return NextResponse.json({ error: "ShortId is required" }, { status: 400 });
  }

  const hostUrl = getHostUrl();

  // Check if URL belongs to this token
  const isUrlOwnedByToken = await kv.sismember(`token:${token}:urls`, shortId);
  if (!isUrlOwnedByToken) {
    return NextResponse.json({ error: "URL not found" }, { status: 404 });
  }

  const encryptedUrl = await kv.get(shortId);
  const expiresAt = await kv.get(`${shortId}:expires`);

  if (!encryptedUrl) {
    return NextResponse.json({ error: "URL not found" }, { status: 404 });
  }

  // Decrypt the URL using the token
  const [urlIvHex, urlEncrypted] = (encryptedUrl as string).split(":");
  const urlIv = Buffer.from(urlIvHex, "hex");
  // Convert hex token to bytes for the key, matching the encryption
  const key = Buffer.from(token, "hex");
  const urlDecipher = createDecipheriv("aes-256-cbc", key, urlIv);
  let decryptedUrl = urlDecipher.update(urlEncrypted, "hex", "utf8");
  decryptedUrl += urlDecipher.final("utf8");

  return NextResponse.json({
    shortId,
    url: decryptedUrl,
    fullUrl: `${hostUrl}/${shortId}`,
    deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
    expiresAt: expiresAt ? new Date(expiresAt as string).toISOString() : undefined,
  });
}
