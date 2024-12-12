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
  if (typeof window === "undefined") {
    const protocol = getProtocol(process.env.NEXT_PUBLIC_HOSTNAME || "");
    return `${protocol}://${process.env.NEXT_PUBLIC_HOSTNAME}`;
  }
  const hostname = process.env.NEXT_PUBLIC_HOSTNAME || window.location.hostname;
  if (!process.env.NEXT_PUBLIC_HOSTNAME) {
    console.log("No NEXT_PUBLIC_HOSTNAME found, using window.location.origin");
    return window.location.origin;
  }
  const protocol = getProtocol(hostname);
  return `${protocol}://${hostname}`;
};
