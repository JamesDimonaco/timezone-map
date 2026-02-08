"use client";

import { useState, useEffect, useCallback } from "react";
import {
  timezoneCities,
  timezoneColors,
  formatTimeInTimezone,
  formatDateInTimezone,
  countryFlag,
  type TimezoneCity,
} from "@/lib/timezones";
import { Clock, Search, X, Plus } from "lucide-react";

type Props = {
  compareCities: TimezoneCity[];
  onAdd: (city: TimezoneCity) => void;
  onRemove: (index: number) => void;
  onClose: () => void;
};

// Get the hour in a timezone (0-23)
function getHourInTimezone(timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).formatToParts(new Date());
    return parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  } catch {
    return 0;
  }
}

// 24-hour timeline bar showing working hours overlap
function TimelineBar({ timezone, color }: { timezone: string; color: string }) {
  const currentHour = getHourInTimezone(timezone);

  return (
    <div className="flex gap-px h-5 rounded overflow-hidden">
      {Array.from({ length: 24 }, (_, h) => {
        const isWork = h >= 9 && h < 17;
        const isCurrent = h === currentHour;
        return (
          <div
            key={h}
            className="flex-1 relative"
            title={`${h.toString().padStart(2, "0")}:00`}
            style={{
              backgroundColor: isCurrent
                ? color
                : isWork
                  ? `${color}40`
                  : "rgba(100,100,100,0.15)",
            }}
          >
            {isCurrent && (
              <div className="absolute inset-0 ring-1 ring-white/50 rounded-sm" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CitySearchInline({
  onSelect,
}: {
  onSelect: (city: TimezoneCity) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = query.trim()
    ? timezoneCities.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.country.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-1.5">
        <Search className="size-3.5 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Add city..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border bg-background/95 backdrop-blur-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.slice(0, 6).map((city) => (
            <button
              key={`${city.name}-${city.country}`}
              onClick={() => {
                onSelect(city);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div
                className="size-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    timezoneColors[city.utcOffset] || "#6366f1",
                }}
              />
              <span className="font-medium">{city.name}</span>
              <span className="text-muted-foreground text-xs">
                {city.country}
              </span>
              <span className="ml-auto text-xs font-mono text-muted-foreground">
                {city.utcOffset}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ComparePanel({
  compareCities,
  onAdd,
  onRemove,
  onClose,
}: Props) {
  const [, setTick] = useState(0);

  // Update every second to keep times in sync
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Find overlapping working hours (9-17)
  const getWorkingHoursOverlap = useCallback(() => {
    if (compareCities.length < 2) return null;

    // For each city, get which UTC hours are 9-17 local
    const workRanges = compareCities.map((city) => {
      const hour = getHourInTimezone(city.timezone);
      const now = new Date();
      const utcHour = now.getUTCHours();
      const offset = hour - utcHour;

      const start = ((9 - offset + 24) % 24);
      const end = ((17 - offset + 24) % 24);
      return { start, end };
    });

    // Find overlap: hours that are working time in ALL cities
    let overlapCount = 0;
    for (let h = 0; h < 24; h++) {
      const allWorking = workRanges.every(({ start, end }) => {
        if (start < end) return h >= start && h < end;
        return h >= start || h < end;
      });
      if (allWorking) overlapCount++;
    }
    return overlapCount;
  }, [compareCities]);

  const overlap = getWorkingHoursOverlap();

  return (
    <div className="pointer-events-auto w-80 rounded-xl border bg-background/95 backdrop-blur-md shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">Compare Times</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-0.5 hover:bg-muted transition-colors"
        >
          <X className="size-4 text-muted-foreground" />
        </button>
      </div>

      {/* City list */}
      <div className="p-3 space-y-3">
        {compareCities.map((city, i) => {
          const color = timezoneColors[city.utcOffset] || "#6366f1";
          const flag = countryFlag(city.country);
          const time = formatTimeInTimezone(city.timezone);
          const date = formatDateInTimezone(city.timezone);

          return (
            <div key={`${city.name}-${i}`} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {flag && <span className="text-sm">{flag}</span>}
                  <span className="font-medium text-sm truncate">
                    {city.name}
                  </span>
                  <div
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold tabular-nums text-sm">{time}</span>
                  <button
                    onClick={() => onRemove(i)}
                    className="rounded p-0.5 hover:bg-muted transition-colors"
                  >
                    <X className="size-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{date}</span>
                <span className="font-mono">{city.utcOffset}</span>
              </div>
              <TimelineBar timezone={city.timezone} color={color} />
            </div>
          );
        })}

        {/* Working hours overlap indicator */}
        {compareCities.length >= 2 && overlap !== null && (
          <div className="rounded-md bg-muted/50 p-2 text-center">
            <span className="text-xs text-muted-foreground">
              Working hours overlap:{" "}
              <span className="font-semibold text-foreground">
                {overlap}h
              </span>
            </span>
          </div>
        )}

        {/* Add city */}
        {compareCities.length < 5 && (
          <CitySearchInline onSelect={onAdd} />
        )}

        {/* Timeline legend */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            <div className="size-2.5 rounded-sm bg-muted-foreground/15" />
            <span>Off hours</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2.5 rounded-sm opacity-40 bg-primary" />
            <span>9am-5pm</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2.5 rounded-sm bg-primary ring-1 ring-white/50" />
            <span>Now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
