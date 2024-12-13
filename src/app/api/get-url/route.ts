import { NextResponse } from "next/server";
import { getHostUrl, isValidToken } from "@/lib/utils";
import { createDecipheriv } from "crypto";
import { createKvAdapter } from "@/lib/adapters/kv-adapter";

export async function POST(request: Request) {
  const { token, shortId } = await request.json();

  if (!shortId) {
    return NextResponse.json({ error: "ShortId is required" }, { status: 400 });
  }

  const db = createKvAdapter();
  const hostUrl = getHostUrl();

  // Check if URL is authenticated
  const meta = await db.get<{ authenticated: boolean }>(`url:${shortId}:meta`);
  const isAuthenticated = meta?.authenticated;

  if (!isAuthenticated) {
    const url = await db.get(shortId);
    const expiresAt = await db.get(`${shortId}:expires`);
    debugger;

    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    return NextResponse.json({
      shortId,
      url,
      fullUrl: `${hostUrl}/${shortId}`,
      deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
      expiresAt: expiresAt
        ? new Date(expiresAt as string).toISOString()
        : undefined,
    });
  }

  // For authenticated URLs, token is required
  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  if (!isValidToken(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Check if URL belongs to this token
  const isUrlOwnedByToken = await db.sismember(`token:${token}:urls`, shortId);
  debugger;
  if (!isUrlOwnedByToken) {
    return NextResponse.json({ error: "URL not found" }, { status: 404 });
  }

  const encryptedUrl = await db.get(shortId);
  const expiresAt = await db.get(`${shortId}:expires`);

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
    expiresAt: expiresAt
      ? new Date(expiresAt as string).toISOString()
      : undefined,
  });
}
