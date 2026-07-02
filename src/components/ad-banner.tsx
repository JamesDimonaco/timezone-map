"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, AD_SLOTS, type AdPlacement } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

type AdFormat = "auto" | "horizontal" | "vertical" | "rectangle";

export function AdBanner({
  placement,
  format = "auto",
  className = "",
}: {
  placement: AdPlacement;
  format?: AdFormat;
  className?: string;
}) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle not loaded yet — script may still be loading
    }
  }, []);

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={AD_SLOTS[placement]}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
