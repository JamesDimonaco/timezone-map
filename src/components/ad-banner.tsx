"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

type AdFormat = "auto" | "horizontal" | "vertical" | "rectangle";

const AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? "";

export function AdBanner({
  format = "auto",
  className = "",
}: {
  format?: AdFormat;
  className?: string;
}) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !AD_SLOT) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle not loaded yet — script may still be loading
    }
  }, []);

  if (!AD_SLOT) return null;

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4648706958423925"
        data-ad-slot={AD_SLOT}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
