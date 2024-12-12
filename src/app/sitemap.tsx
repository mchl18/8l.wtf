import { getHostUrl } from "@/lib/utils";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hostUrl = getHostUrl();

  const routes = ["/", "/api", "/delete-proxy"].map((route) => ({
    url: `${hostUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 1,
  }));

  return [...routes];
}
