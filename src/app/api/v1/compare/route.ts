import { NextRequest, NextResponse } from "next/server";
import { getCityBySlug } from "@/lib/slugs";
import {
  searchCities,
  formatTimeInTimezone,
  formatDateInTimezone,
  getUtcOffsetKey,
  getHourDifference,
  countryFlag,
  type TimezoneCity,
} from "@/lib/timezones";
import { formatHourDifference } from "@/lib/slugs";
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
  const bySlug = getCityBySlug(query.toLowerCase().replace(/\s+/g, "-"));
  if (bySlug) return bySlug;

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

    const fromParam = request.nextUrl.searchParams.get("from");
    const toParam = request.nextUrl.searchParams.get("to");

    if (!fromParam || !toParam) {
      const missing = !fromParam ? "from" : "to";
      return NextResponse.json(
        { ok: false, error: `Missing required parameter: ${missing}` },
        { status: 400 }
      );
    }

    const fromCity = resolveCity(fromParam);
    if (!fromCity) {
      return NextResponse.json(
        {
          ok: false,
          error: `No city or timezone found for: ${fromParam}. Try a city name, UTC offset (e.g. utc+5), or timezone abbreviation (e.g. PST).`,
        },
        { status: 404 }
      );
    }

    const toCity = resolveCity(toParam);
    if (!toCity) {
      return NextResponse.json(
        {
          ok: false,
          error: `No city or timezone found for: ${toParam}. Try a city name, UTC offset (e.g. utc+5), or timezone abbreviation (e.g. PST).`,
        },
        { status: 404 }
      );
    }

    const diff = getHourDifference(fromCity.timezone, toCity.timezone);
    const absDiff = Math.abs(diff);
    const direction =
      diff === 0
        ? `${toCity.name} and ${fromCity.name} are in the same timezone`
        : diff > 0
          ? `${toCity.name} is ${formatHourDifference(diff)} ahead of ${fromCity.name}`
          : `${toCity.name} is ${formatHourDifference(diff)} behind ${fromCity.name}`;

    return NextResponse.json({
      ok: true,
      data: {
        from: buildCityResponse(fromCity),
        to: buildCityResponse(toCity),
        difference: {
          hours: absDiff,
          description: formatHourDifference(diff),
          direction,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
