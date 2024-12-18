import { NextResponse } from "next/server";
import { getHostUrl, validateEncryptedSeedFormat } from "@/lib/utils";
import { getDatabase } from "@/lib/adapters";

const TRANSACTION_TIMEOUT = 5000;

export async function POST(request: Request) {
  let parsedBody;
  try {
    parsedBody = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { shortId, seed } = parsedBody;
  if (!shortId) {
    return NextResponse.json({ error: "ShortId is required" }, { status: 400 });
  }

  const hostUrl = getHostUrl();

  // Now handle DB work
  const db = await getDatabase();
  let transaction = null;

  // Create timeout promise
  const timeoutPromise = new Promise<NextResponse>((_, reject) => {
    setTimeout(
      () => reject(new NextResponse("Transaction timeout", { status: 504 })),
      TRANSACTION_TIMEOUT
    );
  });

  try {
    transaction = await db.transaction();

    // Wrap DB operations in a race with timeout
    const result = await Promise.race([
      (async () => {
        // Parallelize initial DB queries
        const [meta, url, expiresAt, isUrlOwnedBySeed, encryptedUrl] =
          await Promise.all([
            transaction.get<{ isEncrypted: boolean }>(`url:${shortId}:meta`),
            transaction.get(shortId),
            transaction.get(`${shortId}:expires`),
            transaction.sismember(`token:${seed}:urls`, shortId),
            transaction.get(shortId),
          ]);

        const isEncrypted = meta?.isEncrypted;

        // Handle non-authenticated URLs
        if (!isEncrypted) {
          if (!url) {
            await transaction.rollback();
            return NextResponse.json(
              { error: "URL not found" },
              { status: 404 }
            );
          }

          await transaction.commit();
          return NextResponse.json({
            shortId,
            url,
            fullUrl: `${hostUrl}?q=${shortId}`,
            deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
            isEncrypted: false,
            expiresAt: expiresAt
              ? new Date(expiresAt as string).toISOString()
              : undefined,
          });
        }

        if (!seed || !validateEncryptedSeedFormat(seed)) {
          await transaction.rollback();
          return NextResponse.json({ error: "Invalid seed" }, { status: 401 });
        }

        if (!isUrlOwnedBySeed || !encryptedUrl) {
          await transaction.rollback();
          return NextResponse.json({ error: "URL not found" }, { status: 404 });
        }

        await transaction.commit();
        return NextResponse.json({
          shortId,
          url: encryptedUrl,
          fullUrl: `${hostUrl}?q=${shortId}`,
          deleteProxyUrl: `${hostUrl}/delete-proxy?q=${shortId}`,
          isEncrypted: true,
          expiresAt: expiresAt
            ? new Date(expiresAt as string).toISOString()
            : undefined,
        });
      })(),
      timeoutPromise,
    ]);

    return result;
  } catch (error) {
    console.error("Error in get-url:", error);

    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Rollback error:", rollbackError);
      }
    }

    // Handle specific error types
    if ((error as Error).message === "Transaction timeout") {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    // Extra safety: ensure transaction is cleaned up
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (e) {
        // Just log cleanup errors
        console.error("Final cleanup error:", e);
      }
    }
  }
}
