import Link from "next/link";
import {
  type TimezoneCity,
  timezoneCities,
  countryFlag,
} from "@/lib/timezones";
import { cityToSlug } from "@/lib/slugs";
import { formatDistanceKm, haversineKm } from "@/lib/distance";
import { getOffsetMinutes } from "@/lib/dst";
import { formatHourDifferenceLabel } from "@/lib/major-hubs";

function getNearbyCities(
  city: TimezoneCity,
  limit: number,
): { city: TimezoneCity; distanceKm: number; hourDiff: number }[] {
  const now = new Date();
  const baseOffset = getOffsetMinutes(city.timezone, now) / 60;
  const seen = new Set<string>([city.name]);
  return timezoneCities
    .filter((c) => {
      if (seen.has(c.name)) return false;
      seen.add(c.name);
      return true;
    })
    .map((c) => ({
      city: c,
      distanceKm: haversineKm(city.lat, city.lng, c.lat, c.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
    .map(({ city: c, distanceKm }) => ({
      city: c,
      distanceKm,
      hourDiff: getOffsetMinutes(c.timezone, now) / 60 - baseOffset,
    }));
}

export function CityNearbyBlock({ city }: { city: TimezoneCity }) {
  const nearby = getNearbyCities(city, 6);
  if (nearby.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">
        Cities near {city.name}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        The geographically closest cities tracked on Timezones.live, with
        their distance from {city.name} and current time difference.
      </p>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-3 py-2">City</th>
              <th className="text-left font-medium px-3 py-2">Distance</th>
              <th className="text-left font-medium px-3 py-2">
                Time difference
              </th>
            </tr>
          </thead>
          <tbody>
            {nearby.map(({ city: c, distanceKm, hourDiff }) => (
              <tr key={c.name} className="border-t">
                <td className="px-3 py-2">
                  <Link
                    href={`/time/${cityToSlug(c.name)}`}
                    className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    <span aria-hidden>{countryFlag(c.country)}</span>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {c.country}
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {formatDistanceKm(distanceKm)}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {hourDiff === 0
                    ? "same time"
                    : formatHourDifferenceLabel(hourDiff)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
