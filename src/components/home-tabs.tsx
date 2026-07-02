"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Clock, Globe, Map as MapIcon, ArrowRight } from "lucide-react";
import { TimezoneMapLoader } from "@/components/timezone-map-loader";
import { QuickConvert, QUICK_CONVERT_TRY_EVENT } from "@/components/quick-convert";
import { SiteFooter } from "@/components/site-footer";
import { WhatsNew } from "@/components/whats-new";
import { cn } from "@/lib/utils";
import {
  timezoneCities,
  countryFlag,
  formatTimeInTimezone,
  formatDateInTimezone,
} from "@/lib/timezones";
import { cityToSlug } from "@/lib/slugs";

type View = "convert" | "map";

const POPULAR_CITY_NAMES = [
  "New York",
  "London",
  "Tokyo",
  "Los Angeles",
  "Paris",
  "Singapore",
  "Sydney",
  "Dubai",
  "Hong Kong",
  "Berlin",
  "Mumbai",
  "Toronto",
];

const POPULAR_CITIES = POPULAR_CITY_NAMES.flatMap((name) => {
  const city = timezoneCities.find((c) => c.name === name);
  if (!city) return [];
  return [{ name, flag: countryFlag(city.country), slug: cityToSlug(name) }];
});

function SegmentedTabs({
  view,
  onChange,
}: {
  view: View;
  onChange: (v: View) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border bg-background/90 backdrop-blur-md p-0.5 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("convert")}
        aria-pressed={view === "convert"}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
          view === "convert"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Clock className="size-4" />
        Convert
      </button>
      <button
        type="button"
        onClick={() => onChange("map")}
        aria-pressed={view === "map"}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
          view === "map"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <MapIcon className="size-4" />
        Map
      </button>
    </div>
  );
}

function LocalClock() {
  const [tz, setTz] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Reserve vertical space before hydration to avoid layout shift.
  if (!tz) {
    return <div className="h-[1.75rem]" aria-hidden />;
  }

  const time = formatTimeInTimezone(tz);
  const date = formatDateInTimezone(tz);
  const place = tz.split("/").pop()?.replace(/_/g, " ");

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Clock className="size-4" />
      <span className="font-semibold tabular-nums text-foreground">{time}</span>
      <span className="text-muted-foreground/80">
        {date}
        {place ? ` · ${place}` : ""}
      </span>
    </div>
  );
}

function ConvertView({ onOpenMap }: { onOpenMap: () => void }) {
  return (
    <div className="min-h-[calc(100dvh-3rem)] sm:min-h-screen flex flex-col">
      <div className="flex-1 w-full max-w-xl mx-auto px-4 pt-8 pb-12 sm:pt-20">
        {/* Hero */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Convert time zones instantly
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
            Type a time and a city — see it in your local time. Or open the
            interactive world time zone map.
          </p>
        </div>

        {/* The converter (most-used feature) */}
        <div className="mb-3">
          <QuickConvert variant="inline" />
        </div>

        {/* Live local clock */}
        <div className="mb-8">
          <LocalClock />
        </div>

        {/* Open map CTA */}
        <button
          type="button"
          onClick={onOpenMap}
          className="group w-full flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-left shadow-sm hover:bg-accent transition-colors mb-8"
        >
          <span className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapIcon className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">
                Open the interactive map
              </span>
              <span className="block text-xs text-muted-foreground">
                Explore every time zone, day &amp; night, live
              </span>
            </span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Popular cities */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Popular cities
          </h2>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/time/${c.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm hover:bg-accent transition-colors"
              >
                <span>{c.flag}</span>
                {c.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Secondary links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/compare"
            className="rounded-xl border bg-card p-4 hover:bg-accent transition-colors"
          >
            <div className="text-sm font-semibold mb-0.5">Team planner</div>
            <div className="text-xs text-muted-foreground">
              Compare up to 5 cities &amp; find meeting overlap
            </div>
          </Link>
          <Link
            href="/time"
            className="rounded-xl border bg-card p-4 hover:bg-accent transition-colors"
          >
            <div className="text-sm font-semibold mb-0.5">
              Browse all cities
            </div>
            <div className="text-xs text-muted-foreground">
              Current local time for {timezoneCities.length}+ cities
            </div>
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

export function HomeTabs() {
  // SSR-safe default: "convert" leads with the most-used feature on mobile and
  // ships crawlable text. On mount we promote to "map" for desktop / deep links.
  const [view, setView] = useState<View>("convert");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deepLink =
      params.has("compare") ||
      params.has("city") ||
      params.has("lat") ||
      params.has("lng");
    const isDesktop = window.matchMedia("(min-width: 640px)").matches;
    if (deepLink || isDesktop) setView("map");
  }, []);

  const openMap = useCallback(() => setView("map"), []);

  const handleTryExample = useCallback((query: string) => {
    // The converter lives on the map on desktop and on the Convert tab on
    // mobile — make sure one is mounted, then hand it the example.
    if (window.innerWidth < 640) setView("convert");
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent(QUICK_CONVERT_TRY_EVENT, { detail: query })
      );
    }, 120);
  }, []);

  return (
    <div className="relative w-full">
      <WhatsNew onTry={handleTryExample} />
      {/* Mobile top strip */}
      <header className="sm:hidden sticky top-0 z-40 flex h-12 items-center justify-between border-b bg-background/95 backdrop-blur-md px-3">
        <span className="flex items-center gap-1.5 text-sm font-bold">
          <Globe className="size-4 text-primary" />
          Timezones.live
        </span>
        <SegmentedTabs view={view} onChange={setView} />
      </header>

      {/* Desktop floating tab pill */}
      <div className="hidden sm:flex fixed top-3 left-1/2 -translate-x-1/2 z-50">
        <SegmentedTabs view={view} onChange={setView} />
      </div>

      {/* Body */}
      {view === "map" ? (
        <div className="h-[calc(100dvh-3rem)] sm:h-screen w-full">
          {/* The desktop quick-convert bar renders inside the map, stacked
              with the time scrub control. Mobile has its own Convert tab. */}
          <TimezoneMapLoader />
        </div>
      ) : (
        <ConvertView onOpenMap={openMap} />
      )}
    </div>
  );
}
