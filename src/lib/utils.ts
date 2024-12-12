import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getProtocol = (hostname = "") => {
  return hostname.startsWith("localhost") || hostname.startsWith("127.0.0.1")
    ? "http"
    : "https";
};

export const getHostUrl = () => {
  let hostname =
    process.env.NEXT_PUBLIC_HOSTNAME ||
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL;
  if (typeof window === "undefined") {
    const protocol = getProtocol(hostname);
    return `${protocol}://${hostname}`;
  }
  if (!hostname) {
    console.log("No NEXT_PUBLIC_HOSTNAME found, using window.location.origin");
    hostname = window.location.hostname;
  }
  const protocol = getProtocol(hostname);
  return `${protocol}://${hostname}`;
};

export const generateToken = () => {
  const randomBytes = new Uint8Array(64);
  crypto.getRandomValues(randomBytes);
  const token = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return token;
};
