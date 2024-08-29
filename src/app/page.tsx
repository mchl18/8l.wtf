import HomeView from "@/views/home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fast & Secure URL Shortener | Shorten Your Links Instantly | No Bullshit, no ads, just short links.",
  description:
    "Create short, custom URLs quickly and easily with our free URL shortener. No Bullshit, no ads, just short links.",
  keywords:
    "URL shortener, link shortener, custom URLs, link tracking, marketing tools.  No Bullshit, no ads, just short links.",
  openGraph: {
    title: "Fast & Secure URL Shortener | Shorten Your Links Instantly | No Bullshit, no ads, just short links.",
    description:
      "Create short, custom URLs quickly and easily with our free URL shortener. No Bullshit, no ads, just short links.",
    type: "website",
    url: "https://your-domain.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fast & Secure URL Shortener | Shorten Your Links Instantly | No Bullshit, no ads, just short links.",
    description:
      "Create short, custom URLs quickly and easily with our free URL shortener. No Bullshit, no ads, just short links.",
  },
};

export default function Home() {
  return <HomeView />;
}
