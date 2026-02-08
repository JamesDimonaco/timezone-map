import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Timezones.live — Interactive World Timezone Map",
    short_name: "Timezones.live",
    description:
      "Explore every world timezone on a beautiful interactive map. Click any region to see the current local time, UTC offset, and timezone abbreviation.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
