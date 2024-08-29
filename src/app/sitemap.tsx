import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const baseUrl = "https://veryshort.me";

  const routes = [""].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "never" as const,
    priority: 1,
  }));

  return [...routes];
}
