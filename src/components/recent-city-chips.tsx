"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { countryFlag, formatTimeInTimezone, type TimezoneCity } from "@/lib/timezones";
import { getCityBySlug } from "@/lib/slugs";
import {
  parseRecentCities,
  readRecentCitiesRaw,
  recordRecentCity,
  subscribeRecentCities,
} from "@/lib/recent-cities";

/** Records a city page visit on the client, so the page itself stays static. */
export function RecordRecentCityVisit({ slug }: { slug: string }) {
  useEffect(() => recordRecentCity(slug), [slug]);
  return null;
}

export function useRecentCities(): TimezoneCity[] {
  // Server snapshot is null, so recents only appear after hydration.
  const raw = useSyncExternalStore(subscribeRecentCities, readRecentCitiesRaw, () => null);
  return useMemo(
    () =>
      parseRecentCities(raw).flatMap((slug) => {
        const city = getCityBySlug(slug);
        return city ? [city] : [];
      }),
    [raw]
  );
}

const ymd = (tz: string, date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(date);

/** "+1" / "−1" when the calendar date in `tz` differs from the visitor's. */
function dayMarker(tz: string, date: Date): string | null {
  const days = Math.round(
    (Date.parse(ymd(tz, date)) - Date.parse(ymd(Intl.DateTimeFormat().resolvedOptions().timeZone, date))) /
      86_400_000
  );
  if (days > 0) return `+${days}`;
  if (days < 0) return `−${-days}`;
  return null;
}

export function RecentCityChips({
  cities,
  onPick,
}: {
  cities: TimezoneCity[];
  onPick: (city: TimezoneCity, position: number) => void;
}) {
  const [now, setNow] = useState(() => new Date());
  const rowRef = useRef<HTMLDivElement>(null);
  const newest = cities[0]?.name;

  // A tap on a later chip moves it to the front, which may be scrolled out of
  // view on narrow screens.
  useEffect(() => {
    if (rowRef.current) rowRef.current.scrollLeft = 0;
  }, [newest]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      ref={rowRef}
      className="flex items-center gap-1.5 px-3 pb-1.5 pt-1.5 border-t border-border/50 mt-1 overflow-x-auto [scrollbar-width:none]"
    >
      <span className="shrink-0 text-xs text-muted-foreground/60">Recent:</span>
      {cities.map((city, i) => {
        const marker = dayMarker(city.timezone, now);
        return (
          <button
            key={city.name}
            type="button"
            onClick={() => onPick(city, i + 1)}
            className="shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            {countryFlag(city.country)} {city.name}{" "}
            <span className="font-medium tabular-nums text-foreground">
              {formatTimeInTimezone(city.timezone, now)}
            </span>
            {marker && <span className="ml-0.5 text-muted-foreground/80">{marker}</span>}
          </button>
        );
      })}
    </div>
  );
}
