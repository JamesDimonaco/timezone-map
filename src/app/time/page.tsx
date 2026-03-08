import type { Metadata } from "next";
import Link from "next/link";
import {
  timezoneCities,
  timezoneColors,
  countryFlag,
} from "@/lib/timezones";
import { cityToSlug } from "@/lib/slugs";
import { CitySearch } from "./city-search";

export const metadata: Metadata = {
  title: "World City Times — Browse All Timezones & Cities",
  description:
    "Browse current local times for 120+ cities worldwide. Search by city, country, or UTC offset. Find any timezone instantly.",
  keywords:
    "world city times, timezone directory, city time lookup, UTC offset search, current time by city",
  alternates: { canonical: "https://timezones.live/time" },
  openGraph: {
    title: "World City Times — Browse All Timezones & Cities | Timezones.live",
    description:
      "Browse current local times for 120+ cities worldwide. Search by city, country, or UTC offset.",
    url: "https://timezones.live/time",
    type: "website",
  },
};

// Group cities by UTC offset, preserving array order
function groupByOffset() {
  const groups: { offset: string; color: string; cities: typeof timezoneCities }[] = [];
  const seen = new Map<string, number>();

  for (const city of timezoneCities) {
    const idx = seen.get(city.utcOffset);
    if (idx !== undefined) {
      groups[idx].cities.push(city);
    } else {
      seen.set(city.utcOffset, groups.length);
      groups.push({
        offset: city.utcOffset,
        color: timezoneColors[city.utcOffset] ?? "#60a5fa",
        cities: [city],
      });
    }
  }
  return groups;
}

export default function TimePage() {
  const groups = groupByOffset();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        {/* Navigation */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Map
          </Link>
          <span className="text-muted-foreground/40">|</span>
          <Link
            href="/compare"
            className="hover:text-foreground transition-colors"
          >
            Compare
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            World City Times
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Browse current local times for {timezoneCities.length}+ cities
            across every timezone. Search by city, country, timezone
            abbreviation, or UTC offset.
          </p>
        </div>

        {/* Client-side search */}
        <CitySearch />

        {/* All cities grouped by UTC offset */}
        <div className="space-y-8">
          {groups.map(({ offset, color, cities }) => (
            <section key={offset}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-block w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {offset}
                </h2>
                <span className="text-xs text-muted-foreground/60">
                  ({cities.length} {cities.length === 1 ? "city" : "cities"})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Link
                    key={`${city.name}-${city.country}`}
                    href={`/time/${cityToSlug(city.name)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm hover:bg-accent transition-colors"
                  >
                    <span>{countryFlag(city.country)}</span>
                    {city.name}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
