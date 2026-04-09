"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Pencil, Link2, Check } from "lucide-react";
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
  let currentHour = parseInt(
    parts.find((p) => p.type === "hour")?.value || "0",
  );
  if (currentHour === 24) currentHour = 0;
  const currentMinute = parseInt(
    parts.find((p) => p.type === "minute")?.value || "0",
  );
  const diffMinutes = (hour - currentHour) * 60 + (minute - currentMinute);
  return new Date(now.getTime() + diffMinutes * 60 * 1000);
}

/**
 * Track which city was the source of the pinned time so we can
 * encode it in the URL and restore it later.
 */
type PinnedSource = { cityName: string; timezone: string } | null;

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
  const [pinnedSource, setPinnedSource] = useState<PinnedSource>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Live clock tick
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Restore pinned time from URL on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const timeParam = params.get("time");
      const fromParam = params.get("from");
      if (!timeParam || !fromParam) return;
      const match = timeParam.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return;
      const hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      // Find which city matches
      const city = [cityA, cityB].find((c) => c.name === fromParam);
      if (!city) return;
      setPinnedDate(getPinnedDate(hour, minute, city.timezone));
      setPinnedSource({ cityName: city.name, timezone: city.timezone });
    } catch {
      // SSR guard — window not available
    }
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync pinnedDate to URL
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (pinnedDate && pinnedSource) {
        // Derive HH:MM in the source city timezone
        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone: pinnedSource.timezone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).formatToParts(pinnedDate);
        const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
        const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
        url.searchParams.set("time", `${hh === "24" ? "00" : hh}:${mm}`);
        url.searchParams.set("from", pinnedSource.cityName);
      } else {
        url.searchParams.delete("time");
        url.searchParams.delete("from");
      }
      window.history.replaceState(null, "", url.toString());
    } catch {
      // SSR guard
    }
  }, [pinnedDate, pinnedSource]);

  // Force re-render dependency
  void now;

  const displayDate = pinnedDate ?? undefined;

  const handleTimeChange = useCallback(
    (timeValue: string, timezone: string, cityName: string) => {
      if (!timeValue) return;
      const [h, m] = timeValue.split(":").map(Number);
      setPinnedDate(getPinnedDate(h, m, timezone));
      setPinnedSource({ cityName, timezone });
    },
    [],
  );

  const handleReset = useCallback(() => {
    setPinnedDate(null);
    setPinnedSource(null);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
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

      {!pinnedDate && (
        <p className="text-xs text-muted-foreground/60">
          Click a time to convert
        </p>
      )}

      {pinnedDate && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset to live time"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to live
          </button>
          <span className="text-muted-foreground/40">|</span>
          <button
            type="button"
            onClick={handleCopyLink}
            aria-label="Copy shareable link with pinned time"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {linkCopied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="h-3.5 w-3.5" />
                Copy link
              </>
            )}
          </button>
        </div>
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
  onTimeChange: (timeValue: string, timezone: string, cityName: string) => void;
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
      onTimeChange(e.target.value, city.timezone, city.name);
    },
    [onTimeChange, city.timezone, city.name],
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
  const inputValue = `${hh === "24" ? "00" : hh}:${mm}`;

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
        className="text-3xl sm:text-5xl font-bold tabular-nums tracking-tight cursor-pointer hover:opacity-80 transition-opacity underline decoration-dotted underline-offset-4 decoration-1"
        style={{
          color,
          textDecorationColor: `color-mix(in srgb, ${color} 60%, transparent)`,
        }}
      >
        {time}
      </button>
      <Pencil
        className="h-3.5 w-3.5 text-muted-foreground/50"
        aria-hidden="true"
      />
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
