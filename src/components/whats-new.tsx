"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "tzlive-whats-new-seen";

/** Bump this when adding entries below — users who already dismissed an older
    version will see the dialog again with only the entries they haven't seen. */
const LATEST_VERSION = 1;

type WhatsNewEntry = {
  version: number;
  title: string;
  description: string;
  vignette: React.ReactNode;
  /** Example query dropped into the quick converter by the "Try it" button */
  tryQuery?: string;
};

const ENTRIES: WhatsNewEntry[] = [
  {
    version: 1,
    title: "Scrub world time",
    description:
      "Drag the new slider on the map to see day, night and every clock at any moment — past or future. Copy the URL while scrubbed to share that moment.",
    vignette: (
      <div className="flex items-center gap-2.5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs">
        <span className="flex items-center gap-1 font-medium text-amber-500">
          <RotateCcw className="size-3" />
          Live
        </span>
        <span className="relative h-1 w-24 rounded-full bg-foreground/15">
          <span className="absolute -top-[3px] left-2/3 size-2.5 rounded-full bg-amber-400" />
        </span>
        <span className="font-mono tabular-nums text-muted-foreground">
          Thu 6:00 PM · <span className="font-semibold text-amber-500">+3h</span>
        </span>
      </div>
    ),
  },
  {
    version: 1,
    title: "Convert both ways",
    description:
      "The converter now answers “what is my 5pm for them?” — even for several cities at once. Old shapes like “London 9am” still work.",
    tryQuery: "5pm to London, Tokyo",
    vignette: (
      <div className="space-y-1 rounded-lg border bg-background/60 px-3 py-2 text-xs">
        <div className="font-medium text-foreground">5pm to london, tokyo</div>
        <div className="text-muted-foreground">🇬🇧 10:00 AM in London</div>
        <div className="text-muted-foreground">🇯🇵 6:00 PM in Tokyo</div>
      </div>
    ),
  },
];

/**
 * One-time "What's new" dialog. Shows entries the user hasn't seen yet
 * (tracked by version number in localStorage) and hides forever on dismiss —
 * until LATEST_VERSION is bumped with new entries.
 */
export function WhatsNew({ onTry }: { onTry?: (query: string) => void }) {
  const [open, setOpen] = useState(false);
  // Lazy read; treating "unavailable" as fully-seen means we never show the
  // dialog on every load for users whose storage is blocked.
  const [seenVersion] = useState(() => {
    if (typeof window === "undefined") return LATEST_VERSION;
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10) || 0;
    } catch {
      return LATEST_VERSION;
    }
  });

  useEffect(() => {
    if (seenVersion >= LATEST_VERSION) return;
    // Let the map/converter settle before announcing anything.
    const id = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(id);
  }, [seenVersion]);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(LATEST_VERSION));
    } catch {
      // ignore — worst case the dialog shows again next visit
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const fresh = ENTRIES.filter((e) => e.version > seenVersion);
  if (fresh.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="What's new"
    >
      <button
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200 motion-reduce:animate-none"
        onClick={dismiss}
        aria-label="Dismiss"
        tabIndex={-1}
      />
      <div className="relative w-full max-w-md rounded-2xl border bg-background shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-4 text-primary" />
            What&apos;s new
          </h2>
          <button
            onClick={dismiss}
            aria-label="Close"
            className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5">
          {fresh.map((entry) => (
            <div key={entry.title} className="space-y-2">
              <h3 className="text-sm font-medium">{entry.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {entry.description}
              </p>
              <div className="flex items-center gap-2">
                {entry.vignette}
                {entry.tryQuery && onTry && (
                  <button
                    onClick={() => {
                      dismiss();
                      onTry(entry.tryQuery!);
                    }}
                    className="shrink-0 rounded-full border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    Try it
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={dismiss}
          className="mt-5 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
