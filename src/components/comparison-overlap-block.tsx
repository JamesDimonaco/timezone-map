import type { TimezoneCity } from "@/lib/timezones";
import type { CityPairAnalysis } from "@/lib/comparison";
import { formatLocalHour } from "@/lib/major-hubs";

const STATUS_BG: Record<string, string> = {
  sleep: "bg-muted/40 text-muted-foreground",
  late: "bg-muted/40 text-muted-foreground",
  early: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  work: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  evening: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
};

const STATUS_LABEL: Record<string, string> = {
  sleep: "asleep",
  late: "late evening",
  early: "early",
  work: "working hours",
  evening: "evening",
};

function Cell({
  hour,
  status,
}: {
  hour: number;
  status: keyof typeof STATUS_BG;
}) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${STATUS_BG[status]}`}
    >
      {formatLocalHour(hour)}
    </span>
  );
}

export function ComparisonOverlapBlock({
  cityA,
  cityB,
  analysis,
}: {
  cityA: TimezoneCity;
  cityB: TimezoneCity;
  analysis: CityPairAnalysis;
}) {
  const { overlap, planner } = analysis;

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">
        Best meeting times between {cityA.name} and {cityB.name}
      </h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3 mb-5">
        {overlap.hours > 0 &&
        overlap.aStart !== null &&
        overlap.bStart !== null ? (
          <p>
            Standard 9-to-5 working hours overlap by{" "}
            <strong className="text-foreground">
              {overlap.hours.toFixed(overlap.hours % 1 === 0 ? 0 : 1)} hours
            </strong>{" "}
            per day. The shared window is{" "}
            <strong className="text-foreground">
              {formatLocalHour(overlap.aStart)}–
              {formatLocalHour(overlap.aEnd ?? 0)}
            </strong>{" "}
            in {cityA.name}, which is{" "}
            <strong className="text-foreground">
              {formatLocalHour(overlap.bStart)}–
              {formatLocalHour(overlap.bEnd ?? 0)}
            </strong>{" "}
            in {cityB.name}. Schedule recurring meetings inside that window
            and both teams stay inside standard working hours.
          </p>
        ) : (
          <p>
            Standard 9-to-5 working hours in {cityA.name} and {cityB.name} do
            not overlap. To meet synchronously, one side will need to start
            early or stay late — see the hour-by-hour planner below for the
            least disruptive options.
          </p>
        )}
      </div>

      <h3 className="text-sm font-semibold mb-2">Hour-by-hour planner</h3>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-3 py-2">
                {cityA.name}
              </th>
              <th className="text-left font-medium px-3 py-2">
                {cityB.name}
              </th>
              <th className="text-left font-medium px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {planner.map((row) => {
              const bothWork =
                row.aStatus === "work" && row.bStatus === "work";
              const oneEdge =
                (row.aStatus === "work" &&
                  (row.bStatus === "early" || row.bStatus === "evening")) ||
                (row.bStatus === "work" &&
                  (row.aStatus === "early" || row.aStatus === "evening"));
              const status = bothWork
                ? "Both at work — ideal meeting time"
                : oneEdge
                  ? "One side outside 9-to-5 but still awake"
                  : `${cityA.name} ${STATUS_LABEL[row.aStatus]}, ${cityB.name} ${STATUS_LABEL[row.bStatus]}`;
              return (
                <tr key={row.aHour} className="border-t">
                  <td className="px-3 py-1.5">
                    <Cell hour={row.aHour} status={row.aStatus} />
                  </td>
                  <td className="px-3 py-1.5">
                    <Cell hour={row.bHour} status={row.bStatus} />
                  </td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">
                    {status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Green = standard working hours (9 AM – 5 PM). Amber = early (6–9 AM).
        Orange = evening (5–10 PM). Grey = asleep or late.
      </p>
    </section>
  );
}
