"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export type ComparisonItem = {
  cityA: string;
  cityB: string;
  slug: string;
};

export type CityItem = {
  name: string;
  flag: string;
  slug: string;
};

type CompareSearchProps = {
  comparisons: ComparisonItem[];
  cities: CityItem[];
};

export function CompareSearch({ comparisons, cities }: CompareSearchProps) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredComparisons = useMemo(() => {
    if (!normalizedQuery) return comparisons;
    return comparisons.filter(
      (c) =>
        c.cityA.toLowerCase().includes(normalizedQuery) ||
        c.cityB.toLowerCase().includes(normalizedQuery)
    );
  }, [comparisons, normalizedQuery]);

  const filteredCities = useMemo(() => {
    if (!normalizedQuery) return cities;
    return cities.filter((c) =>
      c.name.toLowerCase().includes(normalizedQuery)
    );
  }, [cities, normalizedQuery]);

  return (
    <>
      {/* Search input */}
      <div className="mb-12">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            aria-label="Search cities or comparisons"
            placeholder="Filter cities or comparisons..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Popular comparisons */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Popular comparisons</h2>
        {filteredComparisons.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredComparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/time/${c.slug}`}
                className="rounded-lg border bg-card p-3 text-center hover:bg-accent transition-colors"
              >
                <div className="text-sm font-medium">
                  {c.cityA} to {c.cityB}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No comparisons match &ldquo;{query.trim()}&rdquo;
          </p>
        )}
      </div>

      {/* Browse by city */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Browse by city</h2>
        {filteredCities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filteredCities.map((city) => (
              <Link
                key={city.name}
                href={`/time/${city.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm hover:bg-accent transition-colors"
              >
                <span>{city.flag}</span>
                {city.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No cities match &ldquo;{query.trim()}&rdquo;
          </p>
        )}
      </div>
    </>
  );
}
