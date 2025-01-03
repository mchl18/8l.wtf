import { useEffect, useReducer } from "react";
import { useUrlBySeed } from "@/lib/queries";
import { useSearchParams } from "next/navigation";
import { decrypt, generateShortIdentifier, SEED } from "@/lib/crypto";
import { Card, CardContent } from "./ui/card";
import Link from "next/link";
import { CONFIG } from "@/config";
import storage from "@/lib/storage";

const REDIRECT_DELAY = parseInt(
  process.env.NEXT_PUBLIC_REDIRECT_DELAY || "5000"
);

type State = {
  token: string | undefined;
  seed: string | undefined;
  countdown: number;
  startTime: number;
  redirectError: string | undefined;
};

type Action =
  | { type: "SET_TOKEN"; payload: string }
  | { type: "SET_SEED"; payload: string }
  | { type: "SET_COUNTDOWN"; payload: number }
  | { type: "SET_START_TIME"; payload: number }
  | { type: "SET_REDIRECT_ERROR"; payload: string };

const initialState: State = {
  token: undefined,
  seed: undefined,
  countdown: REDIRECT_DELAY / 1000,
  startTime: 0,
  redirectError: undefined,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "SET_SEED":
      return { ...state, seed: action.payload };
    case "SET_COUNTDOWN":
      return { ...state, countdown: action.payload };
    case "SET_START_TIME":
      return { ...state, startTime: action.payload };
    case "SET_REDIRECT_ERROR":
      return { ...state, redirectError: action.payload };
    default:
      return state;
  }
}

export default function RedirectPage() {
  const searchParams = useSearchParams();
  const shortId = searchParams.get("q")!;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { data, error } = useUrlBySeed(shortId, state.seed);

  useEffect(() => {
    (async () => {
      dispatch({ type: "SET_START_TIME", payload: Date.now() });
      const storedTokenArray = await storage.get(CONFIG.tokenStorageKey);
      if (storedTokenArray) {
        dispatch({ type: "SET_TOKEN", payload: storedTokenArray[0] });
      }
      const paramsToken = searchParams.get("token");
      if (paramsToken) {
        const seed = generateShortIdentifier(SEED, paramsToken, 8);
        dispatch({ type: "SET_TOKEN", payload: paramsToken });
        if (!storedTokenArray) {
          storage.set(CONFIG.tokenStorageKey, [paramsToken, seed]);
        }
      }

      const finalToken = storedTokenArray?.[0] || paramsToken || "";
      if (finalToken) {
        const seed = generateShortIdentifier(SEED, finalToken, 8);
        dispatch({ type: "SET_SEED", payload: seed });
      }
    })();
  }, [searchParams]);

  useEffect(() => {
    if (!state.startTime) {
      return;
    }
    const timer = setInterval(() => {
      const elapsed = Date.now() - state.startTime;
      const remainingSeconds = Math.ceil((REDIRECT_DELAY - elapsed) / 1000);

      if (elapsed >= REDIRECT_DELAY) {
        clearInterval(timer);
        console.log("redirecting to", data);
        if (state.token && data?.isEncrypted) {
          const decryptedToken = decrypt(data.url, state.token);
          try {
            window.location.href = decryptedToken;
          } catch (e) {
            console.error(e);
            dispatch({
              type: "SET_REDIRECT_ERROR",
              payload: `Redirect error: ${(e as Error).message || e}`,
            });
          }
        } else {
          if (!data?.url) {
            return;
          }
          try {
            window.location.href = data.url;
          } catch (e) {
            console.error(e);
            dispatch({
              type: "SET_REDIRECT_ERROR",
              payload: `Redirect error: ${(e as Error).message || e}`,
            });
          }
        }
        return;
      }

      if (remainingSeconds !== state.countdown) {
        dispatch({ type: "SET_COUNTDOWN", payload: remainingSeconds });
      }
    }, 333);

    return () => clearInterval(timer);
  }, [
    state.startTime,
    shortId,
    state.seed,
    data,
    state.token,
    state.countdown,
  ]);

  return (
    <>
      <Card className="bg-black rounded-lg shadow-2xl max-w-md w-full text-center mt-6 border-2 border-purple-600">
        <CardContent className="pt-6">
          {!error && (
            <div className="flex flex-col gap-3">
              <p className="text-purple-600 text-xl">
                Redirecting in {state.countdown} seconds...
              </p>
              <p className="text-purple-600">
                Want to create your own short links?
              </p>
              <Link
                href="/"
                className="text-purple-600 ring-1 ring-purple-500 font-medium py-2 px-4 rounded-md shadow transition duration-150"
              >
                Visit 8l.wtf
              </Link>
            </div>
          )}

          {error && (
            <div className="border-2 border-purple-600 p-4 rounded-md my-2">
              <p className="text-purple-600">{error.message}</p>
            </div>
          )}
          {state.redirectError && (
            <div className="border-2 border-purple-600 p-4 rounded-md my-2">
              <p className="text-purple-600">{state.redirectError}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
