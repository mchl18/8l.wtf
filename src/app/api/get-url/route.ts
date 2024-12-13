import { NextResponse } from "next/server";
import { getHostUrl, validateEncryptedSeedFormat } from "@/lib/utils";
import { getDatabase } from "@/lib/adapters";

const TRANSACTION_TIMEOUT = 5000;

export async function POST(request: Request) {
  // Do non-DB validation work first
  let parsedBody;
  try {
    parsedBody = await request.json();
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { shortId, seed } = parsedBody;
  if (!shortId) {
    return NextResponse.json(
      { error: "ShortId is required" },
      { status: 400 }
    );
  }

  const hostUrl = getHostUrl();

  // Now handle DB work
  const db = await getDatabase();
  let transaction = null;

  // Create timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Transaction timeout')), TRANSACTION_TIMEOUT);
  });

  try {
    transaction = await db.transaction();

    // Wrap DB operations in a race with timeout
    const result = await Promise.race([
      (async () => {
        // Parallelize initial DB queries
        const [meta, url, expiresAt] = await Promise.all([
          transaction.get<{ authenticated: boolean }>(`url:${shortId}:meta`),
          transaction.get(shortId),
          transaction.get(`${shortId}:expires`)
        ]);

        const isAuthenticated = meta?.authenticated;

        // Handle non-authenticated URLs
        if (!isAuthenticated) {
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
            fullUrl: `${hostUrl}/${shortId}`,
            deleteProxyUrl: `${hostUrl}/delete-proxy?id=${shortId}`,
            isEncrypted: false,
            expiresAt: expiresAt
              ? new Date(expiresAt as string).toISOString()
              : undefined,
          });
        }

        // Handle authenticated URLs
        if (!seed) {
          await transaction.rollback();
          return NextResponse.json(
            { error: "Seed is required" },
            { status: 400 }
          );
        }

        if (!validateEncryptedSeedFormat(seed)) {
          await transaction.rollback();
          return NextResponse.json(
            { error: "Invalid seed" },
            { status: 401 }
          );
        }

        // Check URL ownership
        const isUrlOwnedBySeed = await transaction.sismember(
          `token:${seed}:urls`,
          shortId
        );

        if (!isUrlOwnedBySeed) {
          await transaction.rollback();
          return NextResponse.json(
            { error: "URL not found" },
            { status: 404 }
          );
        }

        const encryptedUrl = await transaction.get(shortId);

        if (!encryptedUrl) {
          await transaction.rollback();
          return NextResponse.json(
            { error: "URL not found" },
            { status: 404 }
          );
        }

        await transaction.commit();
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
      })(),
      timeoutPromise
    ]);

    return result;

  } catch (error) {
    console.error('Error in get-url:', error);
    
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }

    // Handle specific error types
    if ((error as Error).message === 'Transaction timeout') {
      return NextResponse.json(
        { error: "Request timed out" },
        { status: 504 }
      );
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
        console.error('Final cleanup error:', e);
      }
    }
  }
}

