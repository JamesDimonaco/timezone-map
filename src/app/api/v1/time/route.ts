import { NextRequest, NextResponse } from "next/server";
import { getCityBySlug } from "@/lib/slugs";
import {
  searchCities,
  formatTimeInTimezone,
  formatDateInTimezone,
  getUtcOffsetKey,
  countryFlag,
  type TimezoneCity,
} from "@/lib/timezones";
import { checkRateLimit } from "@/lib/rate-limit";

function buildCityResponse(city: TimezoneCity) {
  return {
    city: city.name,
    country: city.country,
    flag: countryFlag(city.country),
    timezone: city.timezone,
    utcOffset: getUtcOffsetKey(city.timezone),
    currentTime: formatTimeInTimezone(city.timezone),
    currentDate: formatDateInTimezone(city.timezone),
    coordinates: { lat: city.lat, lng: city.lng },
  };
}

function resolveCity(query: string): TimezoneCity | null {
  // 1. Try slug lookup
  const bySlug = getCityBySlug(query.toLowerCase().replace(/\s+/g, "-"));
  if (bySlug) return bySlug;

  // 2. Try search (first result)
  const results = searchCities(query);
  if (results.length > 0) return results[0];

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed, resetIn } = checkRateLimit(ip);
    if (!allowed) {
      const retryAfter = Math.ceil(resetIn / 1000);
      return NextResponse.json(
        { ok: false, error: `Rate limit exceeded. Try again in ${retryAfter} seconds.` },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      );
    }

    const cityParam = request.nextUrl.searchParams.get("city");
    if (!cityParam) {
      return NextResponse.json(
        { ok: false, error: "Missing required parameter: city" },
        { status: 400 }
      );
    }

    const city = resolveCity(cityParam);
    if (!city) {
      return NextResponse.json(
        {
          ok: false,
          error: `No city or timezone found for: ${cityParam}. Try a city name, UTC offset (e.g. utc+5), or timezone abbreviation (e.g. PST).`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: buildCityResponse(city) });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
