import Script from "next/script";
import { ADSENSE_CLIENT } from "@/lib/ads";

// Shared AdSense loader. Included in each ad-carrying section's layout —
// deliberately NOT in the root layout so the homepage stays ad-free.
export function AdSenseScript() {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
