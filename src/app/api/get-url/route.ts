import { NextResponse } from "next/server";
import { getHostUrl, validateEncryptedSeedFormat } from "@/lib/utils";
import { getDatabase } from "@/lib/adapters";

export async function POST(request: Request) {
  const db = await getDatabase();
  const transaction = await db.transaction();
  try {
    const { shortId, seed } = await request.json();
    if (!shortId) {
      return NextResponse.json(
        { error: "ShortId is required" },
        { status: 400 }
      );
    }

    const hostUrl = getHostUrl();

    // Check if URL is authenticated
    const meta = await transaction.get<{ authenticated: boolean }>(
      `url:${shortId}:meta`
    );
    const isAuthenticated = meta?.authenticated;
    if (!isAuthenticated) {
      const url = await transaction.get(shortId);
      const expiresAt = await transaction.get(`${shortId}:expires`);

      if (!url) {
        return NextResponse.json({ error: "URL not found" }, { status: 404 });
      }

      return NextResponse.json({
        shortId,
        url,
        fullUrl: `${hostUrl}/${shortId}`,
        deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
        isEncrypted: false,
        expiresAt: expiresAt
          ? new Date(expiresAt as string).toISOString()
          : undefined,
      });
    }

    // For authenticated URLs, token is required
    if (!seed) {
      return NextResponse.json({ error: "Seed is required" }, { status: 400 });
    }

    if (!validateEncryptedSeedFormat(seed)) {
      return NextResponse.json({ error: "Invalid seed" }, { status: 401 });
    }

    // Check if URL belongs to this token
    const isUrlOwnedBySeed = await transaction.sismember(
      `token:${seed}:urls`,
      shortId
    );
    if (!isUrlOwnedBySeed) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    const encryptedUrl = await transaction.get(shortId);
    const expiresAt = await transaction.get(`${shortId}:expires`);

    if (!encryptedUrl) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    return NextResponse.json({
      shortId,
      url: encryptedUrl,
      fullUrl: `${hostUrl}/${shortId}`,
      deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
      isEncrypted: true,
      expiresAt: expiresAt
        ? new Date(expiresAt as string).toISOString()
        : undefined,
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
