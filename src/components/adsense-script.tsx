import Script from "next/script";

// Shared AdSense loader. Included in each ad-carrying section's layout —
// deliberately NOT in the root layout so the homepage stays ad-free.
export function AdSenseScript() {
  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4648706958423925"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
