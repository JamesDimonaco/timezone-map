import type { MetadataRoute } from "next";
import { getAllCitySlugs, generateCanonicalComparisonSlugs } from "@/lib/slugs";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://timezones.live";

  const citySlugs = getAllCitySlugs();
  const comparisonSlugs = generateCanonicalComparisonSlugs();

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...citySlugs.map((slug) => ({
      url: `${base}/time/${slug}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    ...comparisonSlugs.map((slug) => ({
      url: `${base}/time/${slug}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.6,
    })),
  ];
}
