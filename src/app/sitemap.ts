import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/dashboard",
    "/dashboard/billing",
    "/dashboard/domains",
    "/dashboard/tokens",
    "/dashboard/links",
    "/dashboard/projects",
    "/dashboard/apps",
  ].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date().toISOString(),
  }));

  return [...routes];
}
