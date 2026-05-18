import type { TimezoneCity } from "@/lib/timezones";
import type { CityPairAnalysis, OffsetSegment } from "@/lib/comparison";

function formatCalendarDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatShortCalendar(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
  }).format(date);
}

function describeDiff(hours: number): string {
  if (hours === 0) return "the same time";
  const abs = Math.abs(hours);
  const whole = Math.floor(abs);
  const minutes = Math.round((abs - whole) * 60);
  const sign = hours > 0 ? "ahead" : "behind";
  if (minutes === 0)
    return `${whole} hour${whole === 1 ? "" : "s"} ${sign}`;
  return `${whole}h ${minutes}m ${sign}`;
}

function findGotchaWindows(
  segments: OffsetSegment[],
  modalDiff: number,
): OffsetSegment[] {
  return segments.filter((s) => s.diffHours !== modalDiff);
}

export function ComparisonDstBlock({
  cityA,
  cityB,
  analysis,
}: {
  cityA: TimezoneCity;
  cityB: TimezoneCity;
  analysis: CityPairAnalysis;
}) {
  const { dst } = analysis;
  const year = new Date().getUTCFullYear();

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">
        Daylight saving time between {cityA.name} and {cityB.name}
      </h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
        {dst.kind === "both-fixed" && (
          <p>
            Neither {cityA.name} nor {cityB.name} observes daylight saving
            time. The time difference between them stays at{" "}
            <strong className="text-foreground">
              {describeDiff(analysis.hourDifference)}
            </strong>{" "}
            all year — recurring meetings only need to be scheduled once.
          </p>
        )}

        {dst.kind === "same-schedule" && (
          <p>
            Both {cityA.name} and {cityB.name} observe daylight saving time
            on the same dates in {year}, so they spring forward and fall back
            together. The difference between them stays at{" "}
            <strong className="text-foreground">
              {describeDiff(analysis.hourDifference)}
            </strong>{" "}
            year-round.
          </p>
        )}

        {dst.kind === "one-observes" && (
          <>
            <p>
              {dst.observerLabel === "A" ? cityA.name : cityB.name} observes
              daylight saving time, but{" "}
              {dst.observerLabel === "A" ? cityB.name : cityA.name} does not.
              That means the difference between the two cities changes
              seasonally — by one hour, around{" "}
              {dst.observerLabel === "A" ? cityA.name : cityB.name}'s
              transition dates.
            </p>
            {dst.segments.length > 1 && (
              <ul className="space-y-1.5 pl-1">
                {dst.segments.map((seg) => (
                  <li
                    key={seg.start.toISOString()}
                    className="flex gap-2 items-baseline"
                  >
                    <span className="text-muted-foreground/70 shrink-0 text-xs font-mono">
                      {formatShortCalendar(seg.start, cityA.timezone)} →{" "}
                      {formatShortCalendar(seg.end, cityA.timezone)}
                    </span>
                    <span>
                      {cityA.name} is{" "}
                      <strong className="text-foreground">
                        {describeDiff(seg.diffHours)}
                      </strong>{" "}
                      {seg.diffHours === 0 ? "" : cityB.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {dst.kind === "different-schedules" && (
          <>
            <p>
              Both cities observe daylight saving time, but on different
              schedules. This creates short windows each year where the usual
              difference of{" "}
              <strong className="text-foreground">
                {describeDiff(dst.modalDiffHours)}
              </strong>{" "}
              temporarily shifts.
            </p>
            {(() => {
              const gotchas = findGotchaWindows(
                dst.segments,
                dst.modalDiffHours,
              );
              if (gotchas.length === 0) return null;
              return (
                <ul className="space-y-1.5 pl-1">
                  {gotchas.map((seg) => (
                    <li
                      key={seg.start.toISOString()}
                      className="flex gap-2 items-baseline"
                    >
                      <span className="text-muted-foreground/70 shrink-0 text-xs font-mono">
                        {formatShortCalendar(seg.start, cityA.timezone)} →{" "}
                        {formatShortCalendar(seg.end, cityA.timezone)}
                      </span>
                      <span>
                        Difference temporarily{" "}
                        <strong className="text-foreground">
                          {describeDiff(seg.diffHours)}
                        </strong>
                        .
                      </span>
                    </li>
                  ))}
                </ul>
              );
            })()}
            <p className="text-xs">
              {cityA.name} transitions on{" "}
              {dst.aTransitions
                .map((t) => formatCalendarDate(t.instant, cityA.timezone))
                .join(" and ")}
              . {cityB.name} transitions on{" "}
              {dst.bTransitions
                .map((t) => formatCalendarDate(t.instant, cityB.timezone))
                .join(" and ")}
              .
            </p>
          </>
        )}
      </div>
    </section>
  );
}
