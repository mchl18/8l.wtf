import { getProtocol } from "@/lib/utils";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hostname = process.env.NEXT_PUBLIC_HOSTNAME || window.location.hostname;
  const protocol = getProtocol(hostname);

  const routes = ["/", "/api", "/delete-proxy"].map((route) => ({
    url: `${protocol}://${hostname}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 1,
  }));

  return [...routes];
}
