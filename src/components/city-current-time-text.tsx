"use client";

import { useEffect, useState } from "react";

function formatCityTime(timezone: string, date: Date): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "--:--";
  }
}

function formatTzAbbr(timezone: string, date: Date): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    if (tzPart === "GMT") return "UTC";
    return tzPart.replace("GMT", "UTC");
  } catch {
    return "";
  }
}

export function CityCurrentTimeText({
  city,
}: {
  city: {
    name: string;
    country: string;
    timezone: string;
    utcOffset: string;
  };
}) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const time = formatCityTime(city.timezone, now);
  const tzAbbr = formatTzAbbr(city.timezone, now);

  return (
    <p>
      The current time in{" "}
      <strong className="text-foreground">{city.name}</strong>, {city.country}{" "}
      is{" "}
      <strong className="text-foreground">
        {time}
        {tzAbbr ? ` (${tzAbbr})` : ""}
      </strong>
      . {city.name} observes{" "}
      <strong className="text-foreground">{city.timezone}</strong> (
      {city.utcOffset}).
    </p>
  );
}
