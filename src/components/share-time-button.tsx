"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Check, Share2 } from "lucide-react";
import { placeForTimezone, placeSlug } from "@/lib/share-time";

/** Copies a /compare/<place> link. With no slug, it uses the visitor's own time zone. */
export function ShareTimeButton({ slug, label }: { slug?: string; label: string }) {
  const posthog = usePostHog();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const place =
      slug ?? placeSlug(placeForTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone, Date.now()));
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/compare/${place}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      posthog?.capture("share_time_link_copied", { place, source: slug ? "city_page" : "compare_index" });
    } catch {
      // Clipboard blocked: open the page instead so the link is in the URL bar.
      router.push(`/compare/${place}`);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border bg-card hover:bg-muted transition-colors"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Link copied" : label}
    </button>
  );
}
