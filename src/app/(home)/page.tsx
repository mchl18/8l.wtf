"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useReducer } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  CopyIcon,
  QrCodeIcon,
  RefreshCcwIcon,
  TrashIcon,
  DownloadIcon,
  LinkIcon,
} from "lucide-react";
import {
  cleanUrl,
  copyToClipboard,
  generateToken,
  isValidToken,
  shortenToken,
} from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { SEED, generateShortIdentifier } from "@/lib/crypto";
import { useQrCode, useShortenUrl } from "@/lib/queries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import RedirectPage from "@/components/redirect";
import { HomeSkeleton } from "@/components/home-skeleton";
import { SwitchIfQueryParam } from "@/components/switch-if-query-param";
import { CONFIG } from "@/config";
import storage from "@/lib/storage";
import { PasteButton } from "@/components/paste-button";
import { toast } from "sonner";
import { urlRegex } from "@/lib/validation";
// import { scan } from "react-scan";

type State = {
  url: string;
  maxAge: number | string;
  presetValue: number | string;
  error: string;
  selectedMode: "forever" | "custom" | "preset" | "";
  token: string;
  isEncrypted: boolean;
  seed: string | null;
  isInvite: boolean;
  showQrModal: boolean;
  showPrivateDisclaimerAgain: boolean;
  showInviteDisclaimerAgain: boolean;
  dontShowPrivateDisclaimer: boolean;
  dontShowInviteDisclaimer: boolean;
  customDuration: number | string;
  customDurationUnit: string;
};

type Action =
  | { type: "SET_URL"; payload: string }
  | { type: "SET_MAX_AGE"; payload: number | string }
  | { type: "SET_PRESET_VALUE"; payload: number | string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_TOKEN"; payload: string }
  | { type: "SET_IS_PRIVATE"; payload: boolean }
  | { type: "SET_IS_INVITE"; payload: boolean }
  | { type: "SET_SHOW_QR_MODAL"; payload: boolean }
  | { type: "SET_SHOW_PRIVATE_DISCLAIMER"; payload: boolean }
  | { type: "SET_SHOW_INVITE_DISCLAIMER"; payload: boolean }
  | { type: "SET_DONT_SHOW_PRIVATE_DISCLAIMER_AGAIN"; payload: boolean }
  | { type: "SET_DONT_SHOW_INVITE_DISCLAIMER_AGAIN"; payload: boolean }
  | { type: "SET_DURATION_FOREVER" }
  | { type: "SET_DURATION_PRESET"; payload: number | string }
  | { type: "SET_DURATION_CUSTOM"; payload: number | string }
  | { type: "SET_CUSTOM_DURATION"; payload: number | string }
  | { type: "SET_CUSTOM_DURATION_UNIT"; payload: string }
  | { type: "RESET_TOKEN" }
  | {
      type: "INITIALIZE_FROM_PARAMS";
      payload: { url: string; token: string };
    };

const initialState: State = {
  url: "",
  maxAge: 0,
  presetValue: 86400,
  error: "",
  selectedMode: "",
  token: "",
  isEncrypted: false,
  seed: null,
  isInvite: false,
  showQrModal: false,
  showPrivateDisclaimerAgain: false,
  showInviteDisclaimerAgain: false,
  dontShowPrivateDisclaimer: false,
  dontShowInviteDisclaimer: false,
  customDuration: "",
  customDurationUnit: "3600",
};

const updateToken = async (token: string, seed: string) => {
  const storedToken = await storage.get(seed, "token");
  if (!storedToken) {
    storage.set(seed, { token, createdAt: new Date().toISOString() }, "token");
  }
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_URL": {
      if (state.url && state.url === action.payload) {
        return state;
      }
      return { ...state, url: action.payload };
    }
    case "SET_MAX_AGE":
      return { ...state, maxAge: action.payload };
    case "SET_PRESET_VALUE":
      return { ...state, presetValue: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_TOKEN": {
      if (state.token && state.token === action.payload && state.error) {
        return { ...state, error: "" };
      }
      if (state.token && state.token === action.payload) {
        return state;
      }
      const seed = generateShortIdentifier(SEED, action.payload, 8);
      updateToken(action.payload, seed);
      return { ...state, token: action.payload, seed };
    }
    case "SET_IS_PRIVATE":
      return { ...state, isEncrypted: action.payload };
    case "SET_IS_INVITE":
      return { ...state, isInvite: action.payload };
    case "SET_SHOW_QR_MODAL":
      return { ...state, showQrModal: action.payload };
    case "RESET_TOKEN": {
      if (!state.token) {
        return state;
      }
      storage.remove(CONFIG.tokenStorageKey);
      return { ...state, token: "", isEncrypted: false, isInvite: false };
    }
    case "SET_CUSTOM_DURATION": {
      if (state.customDuration === action.payload) {
        return state;
      }
      return { ...state, customDuration: action.payload };
    }
    case "SET_CUSTOM_DURATION_UNIT": {
      if (state.customDurationUnit === action.payload) {
        return state;
      }
      return { ...state, customDurationUnit: action.payload };
    }
    case "SET_DURATION_FOREVER": {
      if (state.selectedMode === "forever") {
        return state;
      }
      storage.set(CONFIG.durationModeStorageKey, "forever");
      return {
        ...state,
        maxAge: 0,
        presetValue: "",
        selectedMode: "forever",
      };
    }
    case "SET_DURATION_PRESET": {
      if (state.selectedMode === "preset") {
        return state;
      }
      storage.set(CONFIG.durationModeStorageKey, "preset");
      return {
        ...state,
        maxAge: action.payload,
        presetValue: action.payload,
        selectedMode: "preset",
      };
    }
    case "SET_DURATION_CUSTOM": {
      if (state.selectedMode === "custom") {
        return state;
      }
      storage.set(CONFIG.durationModeStorageKey, "custom");
      return {
        ...state,
        maxAge: action.payload,
        presetValue: "",
        selectedMode: "custom",
      };
    }
    case "SET_DONT_SHOW_PRIVATE_DISCLAIMER_AGAIN":
      return { ...state, dontShowPrivateDisclaimer: action.payload };
    case "SET_DONT_SHOW_INVITE_DISCLAIMER_AGAIN":
      return { ...state, dontShowInviteDisclaimer: action.payload };
    case "SET_SHOW_PRIVATE_DISCLAIMER": {
      storage.set(
        CONFIG.dontShowPrivateDisclaimerStorageKey,
        `${action.payload}`
      );
      return { ...state, showPrivateDisclaimerAgain: action.payload };
    }
    case "SET_SHOW_INVITE_DISCLAIMER": {
      storage.set(
        CONFIG.dontShowInviteDisclaimerStorageKey,
        `${action.payload}`
      );
      return { ...state, showInviteDisclaimerAgain: action.payload };
    }
    case "INITIALIZE_FROM_PARAMS": {
      const seed = generateShortIdentifier(SEED, action.payload.token, 8);
      updateToken(action.payload.token, seed);
      return { ...state, ...action.payload, seed };
    }
    default:
      return state;
  }
}

function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);

  const getCopyUrl = (url: string) => {
    if (state.isInvite) {
      return `${url}&token=${state.token}`;
    }
    return url;
  };

  useEffect(() => {
    if (!state.isEncrypted && state.isInvite) {
      dispatch({ type: "SET_IS_INVITE", payload: false });
    }
  }, [state]);

  useEffect(() => {
    (async () => {
      const durationMode = await storage.get(CONFIG.durationModeStorageKey);
      switch (durationMode) {
        case "forever":
          dispatch({ type: "SET_DURATION_FOREVER" });
          break;
        case "preset":
          dispatch({ type: "SET_DURATION_PRESET", payload: "86400" });
          break;
        case "custom":
          dispatch({ type: "SET_DURATION_CUSTOM", payload: "" });
          break;
        default:
          dispatch({ type: "SET_DURATION_FOREVER" });
          break;
      }
    })();
  }, []);

  useEffect(() => {
    if (state.isEncrypted && !state.dontShowPrivateDisclaimer) {
      dispatch({ type: "SET_SHOW_PRIVATE_DISCLAIMER", payload: true });
    }
  }, [state.isEncrypted, state.dontShowPrivateDisclaimer]);

  useEffect(() => {
    if (state.isInvite && !state.dontShowInviteDisclaimer) {
      dispatch({ type: "SET_SHOW_INVITE_DISCLAIMER", payload: true });
    }
  }, [state.isInvite, state.dontShowInviteDisclaimer]);

  useEffect(() => {
    (async () => {
      // if (typeof window !== "undefined") {
      //   scan({
      //     enabled: true,
      //     log: true, // logs render info to console (default: false)
      //   });
      // }
      const localStorageDontShowPrivateDisclaimer = await storage.get(
        CONFIG.dontShowPrivateDisclaimerStorageKey
      );
      if (localStorageDontShowPrivateDisclaimer === true) {
        dispatch({
          type: "SET_DONT_SHOW_PRIVATE_DISCLAIMER_AGAIN",
          payload: true,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (state.dontShowPrivateDisclaimer) {
      storage.set(CONFIG.dontShowPrivateDisclaimerStorageKey, "true");
    }
  }, [state.dontShowPrivateDisclaimer]);

  useEffect(() => {
    (async () => {
      const localStorageDontShowInviteDisclaimer = await storage.get(
        CONFIG.dontShowInviteDisclaimerStorageKey
      );
      if (localStorageDontShowInviteDisclaimer === true) {
        dispatch({
          type: "SET_DONT_SHOW_INVITE_DISCLAIMER_AGAIN",
          payload: true,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (state.dontShowInviteDisclaimer) {
      storage.set(CONFIG.dontShowInviteDisclaimerStorageKey, "true");
    }
  }, [state.dontShowInviteDisclaimer]);

  const finalCustomDuration = useMemo(() => {
    return (
      parseInt(`${state.customDuration}`) * parseInt(state.customDurationUnit)
    );
  }, [state.customDuration, state.customDurationUnit]);

  const {
    mutate: shortenUrl,
    data: shortenedUrl,
    isPending,
    isSuccess,
    reset,
  } = useShortenUrl(
    state.url,
    state.seed,
    state.selectedMode === "preset"
      ? state.presetValue
      : state.selectedMode === "custom"
      ? finalCustomDuration
      : state.maxAge,
    state.isEncrypted,
    state.token
  );

  

  useEffect(() => {
    reset();
  }, [state.isEncrypted, reset]);

  const { data: qrCode, isLoading: isQrLoading } = useQrCode(
    state.isInvite
      ? `${shortenedUrl?.fullUrl}&token=${state.token}`
      : shortenedUrl?.fullUrl || ""
  );

  const presets = useMemo(
    () => [
      { label: "1 hour", value: 3600 },
      { label: "1 day", value: 86400 },
      { label: "1 week", value: 604800 },
      { label: "1 month", value: 2592000 },
    ],
    []
  );

  const makeToken = useCallback(async () => {
    // dispatch({ type: "SET_ERROR", payload: "" });
    const token = generateToken();
    dispatch({ type: "SET_TOKEN", payload: token });
  }, []);

  useEffect(() => {
    (async () => {
      const defaultUrl = process.env.NEXT_PUBLIC_DEFAULT_URL || "";
      const urlParam = searchParams.get("url") || defaultUrl;
      const queryToken = searchParams.get("token");

      if (queryToken) {
        if (isValidToken(queryToken)) {
          dispatch({
            type: "INITIALIZE_FROM_PARAMS",
            payload: {
              url: urlParam,
              token: queryToken,
            },
          });
        } else {
          dispatch({ type: "SET_ERROR", payload: "Invalid token" });
        }
      } else {
        const tokens = await storage.getAll("token");
        const newestToken = tokens.reduce((newest, current) => {
          if (!newest || !newest.createdAt) return current;
          if (!current || !current.createdAt) return newest;
          return new Date(current.createdAt) > new Date(newest.createdAt)
            ? current
            : newest;
        }, null);
        if (newestToken?.token && isValidToken(newestToken.token)) {
          dispatch({ type: "SET_TOKEN", payload: newestToken.token });
        } else if (!newestToken?.token) {
          dispatch({ type: "SET_URL", payload: urlParam });
        }
      }
    })();
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    dispatch({ type: "SET_ERROR", payload: "" });
    try {
      e.preventDefault();
      shortenUrl();
    } catch (error) {
      console.error(error);
      dispatch({ type: "SET_ERROR", payload: "Something went wrong" });
    }
  };

  const downloadQrCode = () => {
    const link = document.createElement("a");
    link.download = `8l.wtf QR Code - ${new Date().toISOString()}.png`;
    link.href = qrCode || "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handlePaste = (text: string) => {
    if (urlRegex.test(text)) {
      dispatch({ type: "SET_URL", payload: text });
    } else {
      toast.error("Invalid URL");
    }
  };

  const handleError = (error: string) => {
    toast.error(`Could not paste from clipboard: ${error}`);
  };
  const memoizedUrlInput = useMemo(() => {
    return (
      <div className="flex flex-row gap-2">
        <Input
          value={state.url}
          onChange={(e) =>
            dispatch({ type: "SET_URL", payload: e.target.value })
          }
          placeholder="Enter URL to shorten"
          required
          className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
        />
        <PasteButton onPaste={handlePaste} onError={handleError} />
      </div>
    );
  }, [state.url]);

  const memoizedTokenInput = useMemo(() => {
    return state.token ? (
      <Input
        value={shortenToken(state.token)}
        onChange={(e) =>
          dispatch({ type: "SET_TOKEN", payload: e.target.value })
        }
        placeholder="Custom token (optional)"
        className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
      />
    ) : (
      <></>
    );
  }, [state.token]);

  const memoizedCustomDurationInput = useMemo(() => {
    return (
      <Input
        type="number"
        value={state.customDuration}
        onChange={(e) => {
          dispatch({
            type: "SET_CUSTOM_DURATION",
            payload: Number(e.target.value),
          });
        }}
        placeholder="Custom expiry"
        className="text-purple-600 border-purple-600 focus:ring-2 focus:ring-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 text-center"
        min="0"
      />
    );
  }, [state.customDuration]);

  const isValid = isValidToken(state.token);

  const memoizedInviteCheckbox = useMemo(() => {
    return (
      <Checkbox
        id="invite"
        checked={state.isInvite}
        disabled={!isValid || !state.isEncrypted}
        onCheckedChange={(checked) =>
          dispatch({
            type: "SET_IS_INVITE",
            payload: checked as boolean,
          })
        }
        className="border-purple-600 data-[state=checked]:bg-purple-600"
      />
    );
  }, [state.isInvite, isValid, state.isEncrypted]);

  const memoizedPrivateCheckbox = useMemo(() => {
    return (
      <Checkbox
        id="private"
        checked={state.isEncrypted}
        disabled={!isValid}
        onCheckedChange={(checked) =>
          dispatch({
            type: "SET_IS_PRIVATE",
            payload: checked as boolean,
          })
        }
        className="border-purple-600 data-[state=checked]:bg-purple-600"
      />
    );
  }, [state.isEncrypted, isValid]);

  const memoizedShortenButton = useMemo(() => {
    return (
      <Button
        type="submit"
        variant="outline"
        className="px-4 py-2 text-purple-600 hover:bg-purple-600 hover:text-black rounded-lg transition-colors focus:outline-none ring-2 ring-purple-500 ring-opacity-50 active:ring-2 active:ring-purple-500"
      >
        Shorten URL
      </Button>
    );
  }, []);

  const memoizedForeverButton = useMemo(() => {
    return (
      <Button
        type="button"
        variant={"outline"}
        onClick={() => {
          dispatch({ type: "SET_DURATION_FOREVER" });
        }}
        className={`text-sm flex-1 ${
          state.selectedMode === "forever"
            ? "text-purple-600 bg-purple-600 text-black ring-2 ring-purple-500 active:ring-2 active:ring-purple-500"
            : "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
        }`}
      >
        Forever
      </Button>
    );
  }, [state.selectedMode]);

  const isTokenValid = useMemo(() => {
    if (!state.token) return false;
    return isValidToken(state.token);
  }, [state.token]);

  const memoizedMyUrls = useMemo(() => {
    return isTokenValid ? (
      <Link href={`/admin`} className="text-purple-600 hover:text-purple-800">
        My URLs
      </Link>
    ) : (
      <span
        className={`text-purple-600 hover:text-purple-800 ${
          !isTokenValid ? "opacity-50" : ""
        }`}
      >
        My URLs
      </span>
    );
  }, [isTokenValid]);

  const copyToken = useCallback(() => {
    if (state.token) {
      copyToClipboard(state.token);
    }
  }, [state.token]);

  const memoizedCopyTokenButton = useMemo(() => {
    return isTokenValid ? (
      <Button
        type="button"
        size={"icon"}
        variant="outline"
        onClick={copyToken}
        className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black px-2 flex-1 md:w-auto"
      >
        <CopyIcon className="w-4 h-4" />
      </Button>
    ) : (
      <></>
    );
  }, [isTokenValid, copyToken]);

  const handleResetToken = async () => {
    dispatch({ type: "RESET_TOKEN" });
    await storage.remove(CONFIG.tokenStorageKey);
    router.push("/");
  };

  const memoizedResetTokenButton = useMemo(() => {
    return (
      isTokenValid && (
        <Button
          type="button"
          size={"icon"}
          variant="outline"
          onClick={handleResetToken}
          className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black px-2 flex-1 md:w-auto"
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      )
    );
  }, [handleResetToken, isTokenValid]);

  const memoizedCustomButton = useMemo(() => {
    return (
      <Button
        type="button"
        variant={"outline"}
        onClick={() => {
          dispatch({ type: "SET_DURATION_CUSTOM", payload: "" });
        }}
        className={`text-sm flex-1 ${
          state.selectedMode === "custom"
            ? "text-purple-600 bg-purple-600 text-black ring-2 ring-purple-500 active:ring-2 active:ring-purple-500"
            : "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
        }`}
      >
        Custom
      </Button>
    );
  }, [state.selectedMode]);

  const memoizedDurationSelect = useMemo(() => {
    return (
      <Select
        value={`${state.presetValue || ""}`}
        onValueChange={(value) => {
          if (value === "0" || !value) {
            return;
          } else {
            dispatch({
              type: "SET_DURATION_PRESET",
              payload: value,
            });
          }
        }}
        onOpenChange={() => {
          if (
            state.selectedMode !== "custom" &&
            !presets.find(
              (preset) => preset.value === Number(state.presetValue)
            )?.value
          ) {
            dispatch({ type: "SET_DURATION_FOREVER" });
          }
        }}
      >
        <SelectTrigger
          className={`w-full text-sm hover:text-black ${
            state.selectedMode === "preset"
              ? "text-purple-600 bg-purple-600 text-black ring-2 ring-purple-500 active:ring-2 active:ring-purple-500"
              : "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
          }`}
        >
          <SelectValue placeholder="Duration..." />
        </SelectTrigger>
        <SelectContent className="text-purple-600">
          {presets
            .filter((preset) => preset.value !== 0)
            .map((preset) => (
              <SelectItem key={preset.value} value={preset.value.toString()}>
                {preset.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    );
  }, [state.presetValue, state.selectedMode, presets]);

  const memoizedCustomDurationUnitSelect = useMemo(() => {
    return (
      <Select
        value={state.customDurationUnit}
        onValueChange={(value) => {
          dispatch({
            type: "SET_CUSTOM_DURATION_UNIT",
            payload: value,
          });
        }}
      >
        <SelectTrigger
          className={`w-full text-sm hover:text-black ${"border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"}`}
        >
          <SelectValue placeholder="Duration..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">seconds</SelectItem>
          <SelectItem value="60">minutes</SelectItem>
          <SelectItem value="3600">hours</SelectItem>
          <SelectItem value="86400">days</SelectItem>
          <SelectItem value="604800">weeks</SelectItem>
          <SelectItem value="2592000">months</SelectItem>
          <SelectItem value="31536000">years</SelectItem>
        </SelectContent>
      </Select>
    );
  }, [state.customDurationUnit]);

  const memoizedRefreshTokenButton = useMemo(() => {
    return (
      <Button
        type="button"
        variant="outline"
        size={"icon"}
        onClick={makeToken}
        className={`border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black px-2 flex-1 md:w-auto ${
          !isTokenValid ? "w-full" : ""
        }`}
      >
        {isTokenValid ? "" : <span>Generate Token</span>}
        <RefreshCcwIcon className="w-4 h-4" />
      </Button>
    );
  }, [isTokenValid, makeToken]);

  return (
    <>
      <Card className="bg-black rounded-lg shadow-2xl max-w-md w-full text-center mt-6 border-2 border-purple-600">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
              {memoizedUrlInput}

              <div className="flex flex-col gap-2">
                <div className="flex flex-col md:flex-row gap-2">
                  {memoizedTokenInput}
                  <div className="flex flex-row gap-2 w-full">
                    {memoizedCopyTokenButton}
                    {memoizedResetTokenButton}
                    {memoizedRefreshTokenButton}
                  </div>
                </div>
              </div>

              {!state.selectedMode && (
                <div className="flex md:flex-row flex-col w-full gap-2 md:gap-1 justify-center md:items-center">
                  <Skeleton className="h-10 w-full bg-purple-600/20" />
                </div>
              )}
              {state.selectedMode && (
                <div className="flex md:grid grid-cols-3 flex-col w-full gap-2 md:gap-1 justify-center md:items-center">
                  {memoizedForeverButton}
                  {memoizedDurationSelect}
                  {memoizedCustomButton}
                </div>
              )}

              {state.selectedMode === "custom" && (
                <div className="flex flex-row items-center gap-2 justify-center">
                  {memoizedCustomDurationInput}
                  {memoizedCustomDurationUnitSelect}
                </div>
              )}
              {memoizedShortenButton}
              {state.error && <p className="text-red-500">{state.error}</p>}
              {shortenedUrl && isSuccess && (
                <div className="bg-transparent rounded-lg p-4 border-2 border-purple-600">
                  <p className="text-purple-600 mb-2">Shortened URL:</p>
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={getCopyUrl(shortenedUrl?.fullUrl || "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 break-all"
                    >
                      {cleanUrl(shortenedUrl?.fullUrl || "")}
                    </a>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size={"icon"}
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            getCopyUrl(shortenedUrl?.fullUrl || "")
                          )
                        }
                        className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black flex-shrink-0"
                      >
                        <CopyIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size={"icon"}
                        variant="outline"
                        onClick={() =>
                          dispatch({ type: "SET_SHOW_QR_MODAL", payload: true })
                        }
                        className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black flex-shrink-0"
                      >
                        <QrCodeIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {isPending && (
                <div className="bg-transparent rounded-lg p-4 border-2 border-purple-600">
                  <p className="text-purple-600 mb-2">Shortened URL:</p>
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-10 w-full bg-purple-600/20" />
                  </div>
                </div>
              )}
              <div className="flex flex-row items-center gap-2 justify-between">
                <div className="flex flex-row gap-2">
                  <div
                    className={`flex items-center gap-2 justify-center ${
                      !isValidToken(state.token) ? "opacity-50" : ""
                    }`}
                  >
                    {memoizedPrivateCheckbox}
                    <label htmlFor="private" className="text-purple-600">
                      Private URL
                    </label>
                  </div>
                  <div
                    className={`flex items-center gap-2 justify-center ${
                      !isValidToken(state.token) ? "opacity-50" : ""
                    }`}
                  >
                    {memoizedInviteCheckbox}
                    <label htmlFor="invite" className="text-purple-600">
                      Invite
                    </label>
                  </div>
                </div>
                {memoizedMyUrls}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog
        open={state.showPrivateDisclaimerAgain}
        onOpenChange={(open) => {
          dispatch({ type: "SET_SHOW_PRIVATE_DISCLAIMER", payload: open });
        }}
      >
        <DialogContent className="bg-black border-2 border-purple-600">
          <DialogHeader>
            <DialogTitle className="text-purple-600 text-center">
              Private URL Disclaimer
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="text-purple-600">
              Please make sure you read these instructions carefully.
              <ul className="list-disc list-inside flex flex-col gap-2">
                <li>
                  Private URLs are only accessible to the user who has access to
                  the token they were created with.
                </li>
                <li>
                  They will be encrypted with the token, the server cannot read
                  what you are linking.
                </li>
                <li>
                  If you want to share a private URL, you need to invite the
                  user to the URL.
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className={`flex items-center gap-2 justify-center`}>
              <Checkbox
                id="dont-show-private-again"
                checked={state.dontShowPrivateDisclaimer}
                onCheckedChange={(checked) => {
                  dispatch({
                    type: "SET_DONT_SHOW_PRIVATE_DISCLAIMER_AGAIN",
                    payload: checked as boolean,
                  });
                }}
                className="border-purple-600 data-[state=checked]:bg-purple-600"
              />
              <label
                htmlFor="dont-show-private-again"
                className="text-purple-600"
              >
                Don&apos;t show this again
              </label>
            </div>
            <Button
              onClick={() => {
                dispatch({
                  type: "SET_SHOW_PRIVATE_DISCLAIMER",
                  payload: false,
                });
              }}
              variant="outline"
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black mx-auto"
            >
              Accept
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={state.showInviteDisclaimerAgain}
        onOpenChange={(open) =>
          dispatch({ type: "SET_SHOW_INVITE_DISCLAIMER", payload: open })
        }
      >
        <DialogContent className="bg-black border-2 border-purple-600">
          <DialogHeader>
            <DialogTitle className="text-purple-600 text-center">
              Invite Disclaimer
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="text-purple-600 flex flex-col">
              <span className="font-bold mb-4">
                Please make sure you read these instructions carefully.
              </span>
              <ul className="list-disc list-inside flex flex-col gap-2">
                <li>
                  Whoever you invite to this url will be able to see all urls
                  that were created with this token.
                </li>
                <li>Treat invites like inviting someone to a list of urls.</li>
                <li>
                  If you realize you accidentally shared a url with someone you
                  didn&apos;t want to share it with, you can delete it under
                  &ldquo;My URLs&rdquo;
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className={`flex items-center gap-2 justify-center`}>
              <Checkbox
                id="dont-show-invite-again"
                checked={state.dontShowInviteDisclaimer}
                onCheckedChange={(checked) =>
                  dispatch({
                    type: "SET_DONT_SHOW_INVITE_DISCLAIMER_AGAIN",
                    payload: checked as boolean,
                  })
                }
                className="border-purple-600 data-[state=checked]:bg-purple-600"
              />
              <label
                htmlFor="dont-show-invite-again"
                className="text-purple-600"
              >
                Don&apos;t show this again
              </label>
            </div>
          </div>
          <Button
            onClick={() => {
              dispatch({
                type: "SET_SHOW_INVITE_DISCLAIMER",
                payload: false,
              });
            }}
            variant="outline"
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black mx-auto"
          >
            Accept
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={state.showQrModal}
        onOpenChange={(open) =>
          dispatch({ type: "SET_SHOW_QR_MODAL", payload: open })
        }
      >
        <DialogContent className="bg-black border-2 border-purple-600">
          <DialogHeader>
            <DialogTitle className="text-purple-600 text-center">
              QR Code
            </DialogTitle>
          </DialogHeader>
          {qrCode && (
            <div className="flex flex-col items-center gap-4">
              {!isQrLoading && (
                <Image
                  src={qrCode}
                  alt="QR Code"
                  className="rounded-lg"
                  width={300}
                  height={300}
                />
              )}
              {isQrLoading && (
                <Skeleton className="h-300 w-300 bg-purple-600/20" />
              )}
              <Button
                onClick={downloadQrCode}
                variant="outline"
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
              <Link
                href={`/qr?format=base64&text=${btoa(
                  getCopyUrl(encodeURIComponent(shortenedUrl?.fullUrl || ""))
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-black"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Link to QR Code
                </Button>
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Page() {
  return (
    <>
      <Suspense fallback={<HomeSkeleton />}>
        <SwitchIfQueryParam switchTo={<RedirectPage />} queryParamName="q">
          <Home />
        </SwitchIfQueryParam>
      </Suspense>
    </>
  );
}
