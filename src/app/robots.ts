import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/*.php",
          "/_next/static/",
          "/cdn-cgi/",
        ],
      },
    ],
    host: "https://timezones.live",
    sitemap: "https://timezones.live/sitemap.xml",
  };
}
