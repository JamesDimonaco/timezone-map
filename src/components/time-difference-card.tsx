"use client";

import { useEffect, useState } from "react";
import { getHourDifference } from "@/lib/timezones";
import { formatHourDifference } from "@/lib/slugs";

export function TimeDifferenceCard({
  timezoneA,
  timezoneB,
  cityNameA,
  cityNameB,
}: {
  timezoneA: string;
  timezoneB: string;
  cityNameA: string;
  cityNameB: string;
}) {
  const [diff, setDiff] = useState(() =>
    getHourDifference(timezoneA, timezoneB)
  );

  useEffect(() => {
    // Recompute on mount (client-side) and every minute to stay current
    setDiff(getHourDifference(timezoneA, timezoneB));
    const interval = setInterval(() => {
      setDiff(getHourDifference(timezoneA, timezoneB));
    }, 60_000);
    return () => clearInterval(interval);
  }, [timezoneA, timezoneB]);

  const diffText = formatHourDifference(diff);
  const aheadBehind =
    diff > 0
      ? `${cityNameB} is ${diffText} ahead of ${cityNameA}`
      : diff < 0
        ? `${cityNameB} is ${formatHourDifference(Math.abs(diff))} behind ${cityNameA}`
        : `${cityNameA} and ${cityNameB} are in the same timezone`;

  return (
    <div className="rounded-lg border bg-card p-6 text-center mb-10">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Time Difference
      </div>
      <div className="text-2xl font-bold mb-1">{diffText}</div>
      <div className="text-sm text-muted-foreground">{aheadBehind}</div>
    </div>
  );
}
