import Link from "next/link";
import { type TimezoneCity, countryFlag } from "@/lib/timezones";
import { canonicalComparisonSlug } from "@/lib/slugs";
import {
  compareCityToHubs,
  formatHourDifferenceLabel,
  formatLocalHour,
} from "@/lib/major-hubs";

export function CityHubsBlock({ city }: { city: TimezoneCity }) {
  const comparisons = compareCityToHubs(city);
  if (comparisons.length === 0) return null;

  const withOverlap = comparisons.filter((c) => c.overlapHours > 0);
  const example = withOverlap[0];

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">
        Working with {city.name} from around the world
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        Time difference between {city.name} and major business hubs, and the
        window where standard 9-to-5 working hours overlap in both cities.
        {example && example.cityOverlapStart !== null && (
          <>
            {" "}
            For example,{" "}
            <strong className="text-foreground">
              {formatLocalHour(example.cityOverlapStart)}–
              {formatLocalHour(example.cityOverlapEnd ?? 0)}
            </strong>{" "}
            in {city.name} corresponds to{" "}
            <strong className="text-foreground">
              {formatLocalHour(example.hubOverlapStart ?? 0)}–
              {formatLocalHour(example.hubOverlapEnd ?? 0)}
            </strong>{" "}
            in {example.hub.name}.
          </>
        )}
      </p>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-3 py-2">Hub</th>
              <th className="text-left font-medium px-3 py-2">Difference</th>
              <th className="text-left font-medium px-3 py-2">
                Workday overlap
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c) => {
              const compSlug = canonicalComparisonSlug(city, c.hub);
              return (
                <tr key={c.hub.name} className="border-t">
                  <td className="px-3 py-2">
                    <Link
                      href={`/time/${compSlug}`}
                      className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <span aria-hidden>{countryFlag(c.hub.country)}</span>
                      <span className="font-medium">{c.hub.name}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatHourDifferenceLabel(c.hourDifference)}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {c.overlapHours > 0 &&
                    c.cityOverlapStart !== null &&
                    c.hubOverlapStart !== null ? (
                      <>
                        {formatLocalHour(c.cityOverlapStart)}–
                        {formatLocalHour(c.cityOverlapEnd ?? 0)} ({city.name})
                        {" = "}
                        {formatLocalHour(c.hubOverlapStart)}–
                        {formatLocalHour(c.hubOverlapEnd ?? 0)} ({c.hub.name})
                      </>
                    ) : (
                      <span className="italic">no 9-to-5 overlap</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
