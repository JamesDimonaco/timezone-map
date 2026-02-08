"use client";

import { useEffect, useState } from "react";
import { formatTimeInTimezone, formatDateInTimezone } from "@/lib/timezones";

export function TimeDisplay({
  timezone,
  color,
}: {
  timezone: string;
  color: string;
}) {
  const [time, setTime] = useState(() => formatTimeInTimezone(timezone));
  const [date, setDate] = useState(() => formatDateInTimezone(timezone));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatTimeInTimezone(timezone));
      setDate(formatDateInTimezone(timezone));
    }, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight"
        style={{ color }}
      >
        {time}
      </div>
      <div className="text-muted-foreground text-lg">{date}</div>
    </div>
  );
}
