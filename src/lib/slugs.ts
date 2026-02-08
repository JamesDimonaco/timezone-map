import { timezoneCities, type TimezoneCity } from "./timezones";

/**
 * Convert a city name to a URL-safe slug.
 * "São Paulo" → "sao-paulo", "St. John's" → "st-johns"
 */
export function cityToSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/['']/g, "")           // strip apostrophes
    .replace(/\./g, "")             // strip periods
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Pre-built slug → city lookup map
const slugToCityMap = new Map<string, TimezoneCity>();
for (const city of timezoneCities) {
  slugToCityMap.set(cityToSlug(city.name), city);
}

export function getCityBySlug(slug: string): TimezoneCity | undefined {
  return slugToCityMap.get(slug);
}

export function getAllCitySlugs(): string[] {
  return Array.from(slugToCityMap.keys());
}

/**
 * Try all possible `-to-` split positions in a slug.
 * Returns the two cities if a valid pair is found, else null.
 */
export function parseComparisonSlug(
  slug: string
): { cityA: TimezoneCity; cityB: TimezoneCity } | null {
  const parts = slug.split("-");
  for (let i = 1; i < parts.length - 1; i++) {
    if (parts[i] !== "to") continue;
    const slugA = parts.slice(0, i).join("-");
    const slugB = parts.slice(i + 1).join("-");
    const cityA = getCityBySlug(slugA);
    const cityB = getCityBySlug(slugB);
    if (cityA && cityB && cityA !== cityB) {
      return { cityA, cityB };
    }
  }
  return null;
}

/**
 * Returns the canonical (alphabetical) comparison slug for two cities.
 */
export function canonicalComparisonSlug(
  cityA: TimezoneCity,
  cityB: TimezoneCity
): string {
  const slugA = cityToSlug(cityA.name);
  const slugB = cityToSlug(cityB.name);
  const [first, second] = [slugA, slugB].sort();
  return `${first}-to-${second}`;
}

// 30 hub cities for comparison pairs
const HUB_CITY_NAMES = [
  "New York",
  "London",
  "Tokyo",
  "Sydney",
  "Dubai",
  "Singapore",
  "Hong Kong",
  "Los Angeles",
  "Chicago",
  "Paris",
  "Berlin",
  "Mumbai",
  "Delhi",
  "Shanghai",
  "Beijing",
  "Seoul",
  "Toronto",
  "São Paulo",
  "Mexico City",
  "Cairo",
  "Istanbul",
  "Moscow",
  "Bangkok",
  "Jakarta",
  "Nairobi",
  "Johannesburg",
  "Auckland",
  "Honolulu",
  "San Francisco",
  "Miami",
];

/**
 * Generate ~870 comparison slugs (30 hub cities, both orderings).
 * Returns deduplicated slugs.
 */
export function generateComparisonSlugs(): string[] {
  const hubCities = HUB_CITY_NAMES.map((name) => {
    const city = timezoneCities.find((c) => c.name === name);
    if (!city) throw new Error(`Hub city not found: ${name}`);
    return city;
  });

  const slugs = new Set<string>();
  for (let i = 0; i < hubCities.length; i++) {
    for (let j = 0; j < hubCities.length; j++) {
      if (i === j) continue;
      const a = cityToSlug(hubCities[i].name);
      const b = cityToSlug(hubCities[j].name);
      slugs.add(`${a}-to-${b}`);
    }
  }
  return Array.from(slugs);
}

/**
 * Generate only canonical (alphabetically ordered) comparison slugs.
 * ~435 unique pairs (used for sitemap).
 */
export function generateCanonicalComparisonSlugs(): string[] {
  const hubCities = HUB_CITY_NAMES.map((name) => {
    const city = timezoneCities.find((c) => c.name === name);
    if (!city) throw new Error(`Hub city not found: ${name}`);
    return city;
  });

  const slugs = new Set<string>();
  for (let i = 0; i < hubCities.length; i++) {
    for (let j = i + 1; j < hubCities.length; j++) {
      slugs.add(canonicalComparisonSlug(hubCities[i], hubCities[j]));
    }
  }
  return Array.from(slugs);
}

/**
 * Parse a static utcOffset string like "UTC+5:30" into a number (5.5).
 * Deterministic — does not depend on current time or DST.
 */
export function parseUtcOffsetHours(utcOffset: string): number {
  if (utcOffset === "UTC+0") return 0;
  const match = utcOffset.match(/^UTC([+-])(\d+)(?::(\d+))?$/);
  if (!match) return 0;
  const sign = match[1] === "+" ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = match[3] ? parseInt(match[3], 10) : 0;
  return sign * (hours + minutes / 60);
}

/**
 * Format an hour difference as human-readable text.
 * 5 → "5 hours", 5.5 → "5 hours 30 minutes", 0 → "0 hours"
 */
export function formatHourDifference(diff: number): string {
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff);
  const minutes = Math.round((absDiff - hours) * 60);

  const parts: string[] = [];
  if (hours > 0 || minutes === 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  }
  return parts.join(" ");
}
