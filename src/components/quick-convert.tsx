"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  searchCities,
  findCityForTimezone,
  countryFlag,
  timezoneAbbreviations,
  timezoneCities,
  type TimezoneCity,
} from "@/lib/timezones";

type ParsedQuery = {
  hour: number;
  minute: number;
  fromCity: TimezoneCity;
};

/**
 * Parse a time string like "6pm", "6 pm", "14:00", "14", "3:30pm"
 * Returns { hour (0-23), minute } or null.
 */
function parseTime(raw: string): { hour: number; minute: number } | null {
  const trimmed = raw.trim();

  // Match patterns: "6pm", "6 pm", "6:30pm", "6:30 pm", "14:00", "14", "3:30"
  const match = trimmed.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i
  );
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3]?.toLowerCase();

  if (minute < 0 || minute > 59) return null;

  // Reject invalid 12-hour values like "13pm" or "0am"
  if (ampm && (hour < 1 || hour > 12)) return null;

  if (ampm === "pm" && hour < 12) hour += 12;
  if (ampm === "am" && hour === 12) hour = 0;

  // No am/pm: if hour > 23 it's invalid
  if (hour < 0 || hour > 23) return null;

  return { hour, minute };
}

/**
 * Resolve a location string to a TimezoneCity.
 * Tries: timezone abbreviations, UTC offset patterns, city search.
 */
function resolveLocation(location: string): TimezoneCity | null {
  const loc = location.trim();
  if (!loc) return null;

  // 1. Check timezone abbreviations (exact, case-insensitive)
  const locUpper = loc.toUpperCase();
  for (const [abbr, cityName] of Object.entries(timezoneAbbreviations)) {
    if (abbr.toUpperCase() === locUpper) {
      const city = timezoneCities.find((c) => c.name === cityName);
      if (city) return city;
    }
  }

  // 2. Check UTC offset pattern: "UTC+1", "UTC-5", "UTC+5:30"
  const utcMatch = loc.match(/^UTC\s*([+-])\s*(\d{1,2})(?::(\d{2}))?$/i);
  if (utcMatch) {
    const sign = utcMatch[1];
    const hours = utcMatch[2];
    const minutes = utcMatch[3] || "";
    const suffix = minutes ? `:${minutes}` : "";
    const key = `UTC${sign}${hours}${suffix}`;
    const city = timezoneCities.find((c) => c.utcOffset === key);
    if (city) return city;
  }

  // 3. Search cities
  const results = searchCities(loc);
  if (results.length > 0) return results[0];

  return null;
}

/**
 * Parse a full query like "6pm London", "14:00 Tokyo", "3pm EST", "18:00 UTC+1"
 */
function parseQuery(input: string): ParsedQuery | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try splitting: time first, then location
  // Strategy: try progressively longer time prefixes
  // "6pm London" → time="6pm", location="London"
  // "14:00 Tokyo" → time="14:00", location="Tokyo"
  // "3pm EST" → time="3pm", location="EST"
  // "6 pm London" → time="6 pm", location="London"

  // Regex to capture time at the start, then the rest as location
  const timeFirstMatch = trimmed.match(
    /^(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s+(.+)$/i
  );
  if (timeFirstMatch) {
    const time = parseTime(timeFirstMatch[1]);
    const city = resolveLocation(timeFirstMatch[2]);
    if (time && city) {
      return { hour: time.hour, minute: time.minute, fromCity: city };
    }
  }

  // Try: location first, then time (e.g. "London 6pm")
  const locationFirstMatch = trimmed.match(
    /^(.+?)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)$/i
  );
  if (locationFirstMatch) {
    const time = parseTime(locationFirstMatch[2]);
    const city = resolveLocation(locationFirstMatch[1]);
    if (time && city) {
      return { hour: time.hour, minute: time.minute, fromCity: city };
    }
  }

  // Try: "London now" or "now London"
  const nowMatch = trimmed.match(/^(.+?)\s+now$/i) || trimmed.match(/^now\s+(.+)$/i);
  if (nowMatch) {
    const city = resolveLocation(nowMatch[1]);
    if (city) {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: city.timezone, hour: "numeric", minute: "numeric", hour12: false,
      }).formatToParts(new Date());
      const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
      const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
      return { hour: hour === 24 ? 0 : hour, minute, fromCity: city };
    }
  }

  // Try: just a city name (e.g. "London") → treat as "now"
  const city = resolveLocation(trimmed);
  if (city) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: city.timezone, hour: "numeric", minute: "numeric", hour12: false,
    }).formatToParts(new Date());
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
    return { hour: hour === 24 ? 0 : hour, minute, fromCity: city };
  }

  return null;
}

/**
 * Convert a specific time in one timezone to another timezone.
 */
function convertTime(
  hour: number,
  minute: number,
  fromTz: string,
  toTz: string
): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: fromTz,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  let currentH = parseInt(
    parts.find((p) => p.type === "hour")?.value || "0"
  );
  if (currentH === 24) currentH = 0;
  const currentM = parseInt(
    parts.find((p) => p.type === "minute")?.value || "0"
  );
  const diff = (hour - currentH) * 60 + (minute - currentM);
  const targetDate = new Date(now.getTime() + diff * 60 * 1000);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: toTz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(targetDate);
}

function formatInputTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

export function QuickConvert() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userTz = useRef<string>("UTC");
  const userCity = useRef<TimezoneCity | null>(null);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    userTz.current = tz;
    userCity.current = findCityForTimezone(tz);
  }, []);

  const processQuery = useCallback((value: string) => {
    if (!value.trim()) {
      setResult(null);
      return;
    }

    const parsed = parseQuery(value);
    if (!parsed) {
      setResult(null);
      return;
    }

    const { hour, minute, fromCity } = parsed;
    const fromFlag = countryFlag(fromCity.country);
    const fromTimeStr = formatInputTime(hour, minute);

    const toTz = userTz.current;
    const convertedTime = convertTime(hour, minute, fromCity.timezone, toTz);

    const toCity = userCity.current;
    const toName = toCity ? toCity.name : toTz.split("/").pop()?.replace(/_/g, " ") || "your timezone";
    const toFlag = toCity ? countryFlag(toCity.country) : "";

    setResult(
      `${fromFlag} ${fromTimeStr} in ${fromCity.name} = ${toFlag} ${convertedTime} in ${toName}`
    );
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInput(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        processQuery(value);
      }, 300);
    },
    [processQuery]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        processQuery(input);
      }
    },
    [input, processQuery]
  );

  const handleClear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setInput("");
    setResult(null);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="fixed bottom-24 sm:bottom-28 left-0 right-0 z-20 pointer-events-none flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-[500px] bg-background/90 backdrop-blur-md rounded-xl border shadow-lg p-2">
        <div className="relative flex items-center gap-2">
          <svg
            className="absolute left-3 h-4 w-4 text-muted-foreground shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            aria-label="Quick time converter"
            placeholder="Try: 6pm London, Tokyo now, 3pm EST..."
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent pl-9 pr-8 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
          />
          {input && (
            <button
              onClick={handleClear}
              className="absolute right-2 h-5 w-5 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Clear input"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <div aria-live="polite" aria-atomic="true" role="status">
          {result && (
            <div className="px-3 pb-1.5 pt-1 text-sm text-foreground/90 border-t border-border/50 mt-1">
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
