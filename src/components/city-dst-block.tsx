import type { TimezoneCity } from "@/lib/timezones";
import { formatOffsetLabel, getDstInfo, type DstInfo } from "@/lib/dst";

function formatTransitionDate(timezone: string, instant: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(instant);
}

function formatTransitionTime(timezone: string, instant: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(instant);
}

function pickInfo(city: TimezoneCity, currentYear: number): {
  year: number;
  info: DstInfo;
} {
  const currentYearInfo = getDstInfo(city.timezone, currentYear);
  if (!currentYearInfo.observes) {
    return { year: currentYear, info: currentYearInfo };
  }
  const now = Date.now();
  const allPast = currentYearInfo.transitions.every(
    (t) => t.instant.getTime() < now,
  );
  if (allPast) {
    const nextYearInfo = getDstInfo(city.timezone, currentYear + 1);
    if (nextYearInfo.observes) {
      return { year: currentYear + 1, info: nextYearInfo };
    }
  }
  return { year: currentYear, info: currentYearInfo };
}

export function CityDstBlock({ city }: { city: TimezoneCity }) {
  const now = new Date();
  const currentYear = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: city.timezone,
      year: "numeric",
    }).format(now),
    10,
  );
  const { year, info } = pickInfo(city, currentYear);

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">
        Daylight saving time in {city.name}
      </h2>
      {info.observes ? (
        <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            {city.name} observes daylight saving time. In {year}, the clocks
            change as follows:
          </p>
          <ul className="space-y-2 pl-1">
            {info.transitions.map((t) => {
              const isSpring = t.type === "spring-forward";
              return (
                <li key={t.instant.toISOString()} className="flex gap-2">
                  <span aria-hidden className="shrink-0">
                    {isSpring ? "→" : "←"}
                  </span>
                  <span>
                    <strong className="text-foreground">
                      {formatTransitionDate(city.timezone, t.instant)}
                    </strong>
                    {" — "}
                    {isSpring
                      ? "clocks spring forward"
                      : "clocks fall back"}{" "}
                    at {formatTransitionTime(city.timezone, t.instant)} local
                    time (
                    {formatOffsetLabel(t.beforeOffsetMinutes)} →{" "}
                    {formatOffsetLabel(t.afterOffsetMinutes)}).
                  </span>
                </li>
              );
            })}
          </ul>
          <p>
            During DST, business hours in {city.name} shift by one hour
            relative to fixed-offset zones such as UTC, GMT, and most Asian
            and African timezones. If you schedule recurring meetings with{" "}
            {city.name}, expect the difference to change around these dates.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {city.name} does not observe daylight saving time. The local time
          stays at a constant offset of{" "}
          <strong className="text-foreground">{city.utcOffset}</strong>{" "}
          year-round, which makes recurring meetings with {city.name}{" "}
          predictable — the time difference relative to other cities only
          changes when those other cities themselves move on or off DST.
        </p>
      )}
    </section>
  );
}
