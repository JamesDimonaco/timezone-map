"use client";

import { useState } from "react";
import Link from "next/link";
import { searchCities, countryFlag, timezoneColors } from "@/lib/timezones";
import { cityToSlug } from "@/lib/slugs";

export function CitySearch() {
  const [query, setQuery] = useState("");
  const results = query.trim() ? searchCities(query) : [];

  return (
    <div className="mb-10">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cities, countries, or UTC offsets (e.g. PST, UTC+5, Japan)..."
        className="w-full px-4 py-3 rounded-lg border bg-card text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {results.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {results.map((city) => {
            const color = timezoneColors[city.utcOffset] ?? "#60a5fa";
            return (
              <Link
                key={`${city.name}-${city.country}`}
                href={`/time/${cityToSlug(city.name)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm hover:bg-accent transition-colors"
              >
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span>{countryFlag(city.country)}</span>
                {city.name}
                <span className="text-muted-foreground text-xs">
                  {city.utcOffset}
                </span>
              </Link>
            );
          })}
        </div>
      )}
      {query.trim() && results.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          No cities found for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}
