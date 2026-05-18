import type { TimezoneCity } from "@/lib/timezones";
import type { CityPairAnalysis } from "@/lib/comparison";
import { formatDistanceKm } from "@/lib/distance";

function formatFlightHours(hours: number): string {
  if (hours === 0) return "no flight needed at this distance";
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (whole === 0) return `~${minutes} min`;
  if (minutes === 0) return `~${whole}h`;
  return `~${whole}h ${minutes}m`;
}

export function ComparisonDistanceBlock({
  cityA,
  cityB,
  analysis,
}: {
  cityA: TimezoneCity;
  cityB: TimezoneCity;
  analysis: CityPairAnalysis;
}) {
  const { distanceKm, flightHours } = analysis;

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">
        Distance between {cityA.name} and {cityB.name}
      </h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg border bg-card p-3 text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Great-circle distance
          </div>
          <div className="font-mono text-sm font-medium">
            {formatDistanceKm(distanceKm)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-3 text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Direct flight time
          </div>
          <div className="font-mono text-sm font-medium">
            {formatFlightHours(flightHours)}
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {cityA.name} and {cityB.name} are{" "}
        <strong className="text-foreground">
          {formatDistanceKm(distanceKm)}
        </strong>{" "}
        apart along the great-circle route.{" "}
        {flightHours > 0 ? (
          <>
            A direct flight takes roughly{" "}
            <strong className="text-foreground">
              {formatFlightHours(flightHours)}
            </strong>
            , depending on aircraft type, winds, and routing.
          </>
        ) : (
          <>The cities are close enough that ground transport is usually faster than flying.</>
        )}
      </p>
    </section>
  );
}
