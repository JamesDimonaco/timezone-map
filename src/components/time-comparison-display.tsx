"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  formatTimeInTimezone,
  formatDateInTimezone,
  countryFlag,
  type TimezoneCity,
} from "@/lib/timezones";

/**
 * Given a desired hour:minute in a specific timezone, return a Date object
 * offset from "now" by the difference between the desired time and the
 * current wall-clock time in that timezone.
 */
function getPinnedDate(
  hour: number,
  minute: number,
  timezone: string,
): Date {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const currentHour = parseInt(
    parts.find((p) => p.type === "hour")?.value || "0",
  );
  const currentMinute = parseInt(
    parts.find((p) => p.type === "minute")?.value || "0",
  );
  const diffMinutes = (hour - currentHour) * 60 + (minute - currentMinute);
  return new Date(now.getTime() + diffMinutes * 60 * 1000);
}

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
  const [pinnedDate, setPinnedDate] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Force re-render dependency
  void now;

  const displayDate = pinnedDate ?? undefined;

  const handleTimeChange = useCallback(
    (timeValue: string, timezone: string) => {
      if (!timeValue) return;
      const [h, m] = timeValue.split(":").map(Number);
      setPinnedDate(getPinnedDate(h, m, timezone));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setPinnedDate(null);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-2 gap-6 sm:gap-12">
        <ClockCell
          city={cityA}
          color={colorA}
          displayDate={displayDate}
          onTimeChange={handleTimeChange}
        />
        <ClockCell
          city={cityB}
          color={colorB}
          displayDate={displayDate}
          onTimeChange={handleTimeChange}
        />
      </div>

      {pinnedDate && (
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset to live time"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to live
        </button>
      )}
    </div>
  );
}

function ClockCell({
  city,
  color,
  displayDate,
  onTimeChange,
}: {
  city: TimezoneCity;
  color: string;
  displayDate: Date | undefined;
  onTimeChange: (timeValue: string, timezone: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const time = formatTimeInTimezone(city.timezone, displayDate);
  const date = formatDateInTimezone(city.timezone, displayDate);

  const handleTimeClick = useCallback(() => {
    setPickerOpen((prev) => !prev);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onTimeChange(e.target.value, city.timezone);
    },
    [onTimeChange, city.timezone],
  );

  // Derive current HH:MM in this timezone for the input's value
  const currentDate = displayDate ?? new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: city.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(currentDate);
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  const inputValue = `${hh}:${mm}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-2xl mb-2">{countryFlag(city.country)}</div>
      <div className="text-sm text-muted-foreground font-medium">
        {city.name}, {city.country}
      </div>
      <button
        type="button"
        onClick={handleTimeClick}
        aria-label={`Set time for ${city.name}`}
        className="text-3xl sm:text-5xl font-bold tabular-nums tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
        style={{ color }}
      >
        {time}
      </button>
      {pickerOpen && (
        <input
          ref={inputRef}
          type="time"
          value={inputValue}
          onChange={handleInputChange}
          autoFocus
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          aria-label={`Time picker for ${city.name}`}
          className="mt-1 rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
        />
      )}
      <div className="text-muted-foreground text-sm">{date}</div>
    </div>
  );
}
