"use client";

import { useEffect, useState } from "react";
import {
  formatTimeInTimezone,
  formatDateInTimezone,
  countryFlag,
  type TimezoneCity,
} from "@/lib/timezones";

export function TimeComparisonDisplay({
  cityA,
  cityB,
  colorA,
  colorB,
}: {
  cityA: TimezoneCity;
  cityB: TimezoneCity;
  colorA: string;
  colorB: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Force re-render dependency
  void now;

  return (
    <div className="grid grid-cols-2 gap-6 sm:gap-12">
      <ClockCell city={cityA} color={colorA} />
      <ClockCell city={cityB} color={colorB} />
    </div>
  );
}

function ClockCell({
  city,
  color,
}: {
  city: TimezoneCity;
  color: string;
}) {
  const time = formatTimeInTimezone(city.timezone);
  const date = formatDateInTimezone(city.timezone);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-2xl mb-2">
        {countryFlag(city.country)}
      </div>
      <div className="text-sm text-muted-foreground font-medium">
        {city.name}, {city.country}
      </div>
      <div
        className="text-3xl sm:text-5xl font-bold tabular-nums tracking-tight"
        style={{ color }}
      >
        {time}
      </div>
      <div className="text-muted-foreground text-sm">{date}</div>
    </div>
  );
}
