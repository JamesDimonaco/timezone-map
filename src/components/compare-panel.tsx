"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  timezoneColors,
  formatTimeInTimezone,
  formatDateInTimezone,
  formatHourAs12h,
  countryFlag,
  findCityForTimezone,
  searchCities,
  type TimezoneCity,
  type CompareSlot,
} from "@/lib/timezones";
import { Clock, Search, X, Link2, Check, MapPin, PhoneCall, RotateCcw, ChevronDown } from "lucide-react";
import { usePostHog } from "posthog-js/react";

type Props = {
  compareSlots: CompareSlot[];
  userTimezone: string;
  onAdd: (city: TimezoneCity) => void;
  onRemove: (index: number) => void;
  onLabelChange: (index: number, label: string) => void;
  onClose: () => void;
};

type PinnedTime = {
  cityName: string;
  hour: number; // 0-23
  minute: number; // 0-59
};

// Get the current hour and minute in a timezone
function getTimeInTimezone(timezone: string): { hour: number; minute: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(new Date());
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    return { hour: hour === 24 ? 0 : hour, minute };
  } catch {
    return { hour: 0, minute: 0 };
  }
}

// Get the hour in a timezone (0-23)
function getHourInTimezone(timezone: string): number {
  return getTimeInTimezone(timezone).hour;
}

// Given a pinned time in a specific timezone, return a Date representing that moment
function getPinnedDate(hour: number, minute: number, timezone: string): Date {
  const now = new Date();
  const current = getTimeInTimezone(timezone);
  const diffMinutes = (hour - current.hour) * 60 + (minute - current.minute);
  return new Date(now.getTime() + diffMinutes * 60 * 1000);
}

// Get the hour and minute at a specific Date in a timezone
function getTimeAtDate(date: Date, timezone: string): { hour: number; minute: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(date);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    return { hour: hour === 24 ? 0 : hour, minute };
  } catch {
    return { hour: 0, minute: 0 };
  }
}

// Format time at a specific Date in a timezone
function formatTimeAt(date: Date, timezone: string): string {
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

// Format date at a specific Date in a timezone
function formatDateAt(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

type OverlapInfo = {
  overlapUtcHours: number[];
  count: number;
  perSlot: { label?: string; cityName: string; localStart: number; localEnd: number }[];
  bestSlots: { utcHour: number; times: { label?: string; city: string; formatted: string }[] }[];
};

function computeOverlapInfo(slots: CompareSlot[]): OverlapInfo | null {
  if (slots.length < 2) return null;

  const now = new Date();
  const utcHour = now.getUTCHours();

  // For each slot, compute the offset from UTC
  const slotOffsets = slots.map((s) => {
    const localHour = getHourInTimezone(s.city.timezone);
    return localHour - utcHour;
  });

  // For each slot, find which UTC hours correspond to 9-17 local
  const workRanges = slotOffsets.map((offset) => {
    const start = ((9 - offset + 24) % 24);
    const end = ((17 - offset + 24) % 24);
    return { start, end };
  });

  // Find overlap: UTC hours that are working time in ALL slots
  const overlapUtcHours: number[] = [];
  for (let h = 0; h < 24; h++) {
    const allWorking = workRanges.every(({ start, end }) => {
      if (start < end) return h >= start && h < end;
      return h >= start || h < end;
    });
    if (allWorking) overlapUtcHours.push(h);
  }

  // Per-slot local start/end of overlap
  const perSlot = slots.map((s, i) => {
    const offset = slotOffsets[i];
    if (overlapUtcHours.length === 0) {
      return { label: s.label, cityName: s.city.name, localStart: 0, localEnd: 0 };
    }
    const localStart = ((overlapUtcHours[0] + offset) % 24 + 24) % 24;
    const localEnd = ((overlapUtcHours[overlapUtcHours.length - 1] + offset + 1) % 24 + 24) % 24;
    return { label: s.label, cityName: s.city.name, localStart, localEnd };
  });

  // Best slots: score each overlap hour by proximity to midday (12) across all cities
  const scored = overlapUtcHours.map((utcH) => {
    const score = slotOffsets.reduce((sum, offset) => {
      const localH = ((utcH + offset) % 24 + 24) % 24;
      return sum + (8 - Math.abs(localH - 12));
    }, 0);
    const times = slots.map((s, i) => {
      const localH = ((utcH + slotOffsets[i]) % 24 + 24) % 24;
      return { label: s.label, city: s.city.name, formatted: formatHourAs12h(localH) };
    });
    return { utcHour: utcH, score, times };
  });

  scored.sort((a, b) => b.score - a.score);
  const bestSlots = scored.slice(0, 3).map(({ utcHour, times }) => ({ utcHour, times }));

  return { overlapUtcHours, count: overlapUtcHours.length, perSlot, bestSlots };
}

type BestCallInfo = {
  awakeOverlapCount: number;
  bestHour: { utcHour: number; times: { label?: string; city: string; formatted: string }[] } | null;
};

function computeBestCallTime(slots: CompareSlot[]): BestCallInfo | null {
  if (slots.length < 2) return null;

  const now = new Date();
  const utcHour = now.getUTCHours();

  const slotOffsets = slots.map((s) => {
    const localHour = getHourInTimezone(s.city.timezone);
    return localHour - utcHour;
  });

  // Awake window: 8am–10pm (14 hours)
  const awakeRanges = slotOffsets.map((offset) => {
    const start = ((8 - offset + 24) % 24);
    const end = ((22 - offset + 24) % 24);
    return { start, end };
  });

  const awakeOverlapHours: number[] = [];
  for (let h = 0; h < 24; h++) {
    const allAwake = awakeRanges.every(({ start, end }) => {
      if (start < end) return h >= start && h < end;
      return h >= start || h < end;
    });
    if (allAwake) awakeOverlapHours.push(h);
  }

  if (awakeOverlapHours.length === 0) {
    return { awakeOverlapCount: 0, bestHour: null };
  }

  // Score each hour by proximity to 2pm (14:00) local — pleasant call time
  const scored = awakeOverlapHours.map((utcH) => {
    const score = slotOffsets.reduce((sum, offset) => {
      const localH = ((utcH + offset) % 24 + 24) % 24;
      return sum + (10 - Math.abs(localH - 14));
    }, 0);
    return { utcH, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  const times = slots.map((s, i) => {
    const localH = ((best.utcH + slotOffsets[i]) % 24 + 24) % 24;
    return { label: s.label, city: s.city.name, formatted: formatHourAs12h(localH) };
  });

  return {
    awakeOverlapCount: awakeOverlapHours.length,
    bestHour: { utcHour: best.utcH, times },
  };
}

// 24-hour timeline bar showing working hours overlap
function TimelineBar({
  timezone,
  color,
  overlapHours,
}: {
  timezone: string;
  color: string;
  overlapHours?: number[];
}) {
  const currentHour = getHourInTimezone(timezone);
  const now = new Date();
  const utcHour = now.getUTCHours();
  const offset = currentHour - utcHour;

  return (
    <div className="space-y-0.5">
      <div className="flex gap-px h-5 rounded overflow-hidden relative">
        {Array.from({ length: 24 }, (_, h) => {
          const isWork = h >= 9 && h < 17;
          const isCurrent = h === currentHour;
          // Check if this local hour maps to an overlap UTC hour
          const utcForThisHour = ((h - offset) % 24 + 24) % 24;
          const isOverlap = overlapHours?.includes(utcForThisHour);
          return (
            <div
              key={h}
              className={`flex-1 relative ${isOverlap ? "border-t-2 border-emerald-400/60" : ""}`}
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
                <div className="absolute inset-0 ring-2 ring-white/70 rounded-sm z-10" />
              )}
            </div>
          );
        })}
      </div>
      {/* Hour markers */}
      <div className="flex justify-between text-[8px] text-muted-foreground/50 font-mono px-px">
        <span>0</span>
        <span>6</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>
    </div>
  );
}

function EditableLabel({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      cancelledRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editing, value]);

  const save = () => {
    if (cancelledRef.current) return;
    // Strip colons (URL delimiter)
    const clean = draft.replace(/:/g, "").trim();
    onChange(clean);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        name="timezone-label"
        autoComplete="off"
        data-1p-ignore
        data-lpignore="true"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            cancelledRef.current = true;
            setEditing(false);
          }
        }}
        className="bg-transparent outline-none text-sm font-medium border-b border-primary/50 w-full max-w-[140px]"
        maxLength={20}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-sm font-medium truncate text-left hover:text-primary transition-colors"
    >
      {value || (
        <span className="text-muted-foreground/60 text-xs">+ Add name...</span>
      )}
    </button>
  );
}

function InlineTimePicker({
  initialHour,
  initialMinute,
  onSet,
  onCancel,
}: {
  initialHour: number;
  initialMinute: number;
  onSet: (hour: number, minute: number) => void;
  onCancel: () => void;
}) {
  const [hour12, setHour12] = useState(() => {
    const h = initialHour % 12;
    return h === 0 ? 12 : h;
  });
  const [minute, setMinute] = useState(() => {
    const options = [0, 15, 30, 45];
    return options.reduce((prev, curr) =>
      Math.abs(curr - initialMinute) < Math.abs(prev - initialMinute) ? curr : prev
    );
  });
  const [isPM, setIsPM] = useState(initialHour >= 12);

  const handleSet = () => {
    let h24 = hour12 % 12;
    if (isPM) h24 += 12;
    onSet(h24, minute);
  };

  return (
    <div className="flex items-center gap-1 mt-1.5">
      <select
        value={hour12}
        onChange={(e) => setHour12(Number(e.target.value))}
        className="bg-muted/50 rounded px-1 py-0.5 text-xs font-mono outline-none border border-border/50"
      >
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="text-xs text-muted-foreground">:</span>
      <select
        value={minute}
        onChange={(e) => setMinute(Number(e.target.value))}
        className="bg-muted/50 rounded px-1 py-0.5 text-xs font-mono outline-none border border-border/50"
      >
        {[0, 15, 30, 45].map((m) => (
          <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
        ))}
      </select>
      <button
        onClick={() => setIsPM(!isPM)}
        className="bg-muted/50 rounded px-1.5 py-0.5 text-[10px] font-semibold border border-border/50 hover:bg-muted transition-colors min-w-[28px]"
      >
        {isPM ? "PM" : "AM"}
      </button>
      <button
        onClick={handleSet}
        className="bg-primary text-primary-foreground rounded px-2 py-0.5 text-[10px] font-semibold hover:bg-primary/90 transition-colors"
      >
        Set
      </button>
      <button
        onClick={onCancel}
        className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
      >
        <X className="size-3" />
      </button>
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

  const filtered = searchCities(query);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-1.5">
        <Search className="size-3.5 text-muted-foreground shrink-0" />
        <input
          type="search"
          name="city-search"
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
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
  compareSlots,
  userTimezone,
  onAdd,
  onRemove,
  onLabelChange,
  onClose,
}: Props) {
  const posthog = usePostHog();
  const [, setTick] = useState(0);
  const [showCopied, setShowCopied] = useState(false);
  const [pinnedTime, setPinnedTime] = useState<PinnedTime | null>(null);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [showOverlap, setShowOverlap] = useState(false);

  // Update every second to keep times in sync
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Clear pin when pinned city is removed
  useEffect(() => {
    if (pinnedTime && !compareSlots.some((s) => s.city.name === pinnedTime.cityName)) {
      setPinnedTime(null);
      setEditingSlot(null);
    }
  }, [compareSlots, pinnedTime]);

  // Compute pinned date for time conversion
  const pinnedCity = pinnedTime
    ? compareSlots.find((s) => s.city.name === pinnedTime.cityName)
    : null;
  const pinnedDate = pinnedTime && pinnedCity
    ? getPinnedDate(pinnedTime.hour, pinnedTime.minute, pinnedCity.city.timezone)
    : null;
  const pinnedTimeStr = pinnedTime
    ? `${pinnedTime.hour % 12 || 12}:${pinnedTime.minute.toString().padStart(2, "0")} ${pinnedTime.hour >= 12 ? "PM" : "AM"}`
    : "";

  const overlapInfo = computeOverlapInfo(compareSlots);
  const bestCallInfo = computeBestCallTime(compareSlots);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    posthog?.capture("compare_link_shared", {
      cities: compareSlots.map((s) => s.city.name),
      city_count: compareSlots.length,
    });
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  }, [posthog, compareSlots]);

  const myCity = findCityForTimezone(userTimezone);
  const alreadyHasMe = myCity
    ? compareSlots.some((s) => s.city.name === myCity.name && s.city.country === myCity.country)
    : true;

  return (
    <div className="pointer-events-auto w-full sm:w-80 rounded-xl border bg-background/95 backdrop-blur-md shadow-lg flex flex-col max-h-[calc(100vh-5rem)] sm:max-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">Compare Times</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyLink}
            className="rounded-md p-1 hover:bg-muted transition-colors"
            title="Copy share link"
          >
            {showCopied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Link2 className="size-3.5 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-0.5 hover:bg-muted transition-colors"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Pinned time banner */}
      {pinnedTime && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-primary/10 border-b shrink-0">
          <span className="text-xs text-primary font-medium">
            {pinnedTimeStr} in {pinnedTime.cityName}
          </span>
          <button
            onClick={() => { setPinnedTime(null); setEditingSlot(null); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="size-3" />
            Live
          </button>
        </div>
      )}

      {/* Scrollable city list */}
      <div className="overflow-y-auto flex-1 min-h-0">
        <div className="p-3 space-y-3">
          {compareSlots.map((slot, i) => {
            const { city } = slot;
            const color = timezoneColors[city.utcOffset] || "#6366f1";
            const flag = countryFlag(city.country);
            const isPinSource = pinnedTime?.cityName === city.name;
            const time = pinnedDate ? formatTimeAt(pinnedDate, city.timezone) : formatTimeInTimezone(city.timezone);
            const date = pinnedDate ? formatDateAt(pinnedDate, city.timezone) : formatDateInTimezone(city.timezone);

            return (
              <div key={`${city.name}-${i}`} className="space-y-1.5 rounded-lg bg-muted/30 p-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {flag && <span className="text-sm">{flag}</span>}
                    <EditableLabel
                      value={slot.label || ""}
                      placeholder="+ Add name..."
                      onChange={(val) => onLabelChange(i, val)}
                    />
                  </div>
                  <button
                    onClick={() => onRemove(i)}
                    className="rounded p-0.5 hover:bg-muted transition-colors shrink-0"
                  >
                    <X className="size-3 text-muted-foreground" />
                  </button>
                </div>
                {/* Show city name below the label */}
                <div className="text-xs text-muted-foreground pl-7">
                  {city.name}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingSlot(editingSlot === i ? null : i)}
                      className="text-lg font-bold tabular-nums hover:opacity-80 transition-opacity text-left"
                      style={{ color }}
                      title="Click to set a specific time"
                    >
                      {time}
                    </button>
                    {isPinSource && (
                      <span className="text-[9px] text-primary/70 font-medium uppercase tracking-wide">set</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted-foreground">{date}</div>
                    <div className="text-[10px] font-mono text-muted-foreground/70">{city.utcOffset}</div>
                  </div>
                </div>
                {editingSlot === i && (() => {
                  const pickerTime = pinnedDate
                    ? getTimeAtDate(pinnedDate, city.timezone)
                    : getTimeInTimezone(city.timezone);
                  return (
                    <InlineTimePicker
                      initialHour={pickerTime.hour}
                      initialMinute={pinnedDate ? pickerTime.minute : 0}
                      onSet={(h, m) => {
                        setPinnedTime({ cityName: city.name, hour: h, minute: m });
                        setEditingSlot(null);
                      }}
                      onCancel={() => setEditingSlot(null)}
                    />
                  );
                })()}
                <TimelineBar
                  timezone={city.timezone}
                  color={color}
                  overlapHours={overlapInfo?.overlapUtcHours}
                />
              </div>
            );
          })}

          {/* Work hours overlap toggle */}
          {compareSlots.length >= 2 && (
            <>
              <button
                onClick={() => setShowOverlap(!showOverlap)}
                className="flex items-center gap-1.5 w-full justify-center rounded-md bg-muted/30 px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <PhoneCall className="size-3" />
                <span>{showOverlap ? "Hide" : "Show"} work hours overlap</span>
                <ChevronDown className={`size-3 transition-transform ${showOverlap ? "rotate-180" : ""}`} />
              </button>
              {showOverlap && (
                <div className="space-y-3">
                  {overlapInfo && (
                    <div className="rounded-md bg-muted/50 p-2.5 space-y-2">
                      {overlapInfo.count > 0 ? (
                        <>
                          <div className="text-xs text-muted-foreground text-center">
                            Overlap:{" "}
                            <span className="font-semibold text-foreground">
                              {overlapInfo.count}h
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {overlapInfo.perSlot.map((ps, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[11px]">
                                <span className="text-muted-foreground truncate max-w-[100px]">
                                  {ps.label || ps.cityName}
                                </span>
                                <span className="font-mono text-foreground/80">
                                  {formatHourAs12h(ps.localStart)} – {formatHourAs12h(ps.localEnd)}
                                </span>
                              </div>
                            ))}
                          </div>
                          {overlapInfo.bestSlots.length > 0 && (
                            <div className="border-t border-border/50 pt-2 space-y-1">
                              <div className="text-[10px] text-muted-foreground font-medium">Best times:</div>
                              {overlapInfo.bestSlots.map((bs, idx) => (
                                <div key={idx} className="text-[10px] text-foreground/70 font-mono flex flex-wrap gap-x-2">
                                  {bs.times.map((t, j) => (
                                    <span key={j}>
                                      {t.formatted} {t.label || t.city}
                                    </span>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground text-center">
                          No overlapping work hours
                        </div>
                      )}
                    </div>
                  )}
                  {bestCallInfo && (
                    <div className="rounded-md bg-sky-500/5 border border-sky-500/20 p-2.5 space-y-2">
                      <div className="flex items-center gap-1.5 justify-center">
                        <PhoneCall className="size-3.5 text-sky-500" />
                        <span className="text-xs font-medium text-sky-600 dark:text-sky-400">Best time to call</span>
                      </div>
                      {bestCallInfo.bestHour ? (
                        <>
                          <div className="space-y-0.5">
                            {bestCallInfo.bestHour.times.map((t, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[11px]">
                                <span className="text-muted-foreground truncate max-w-[120px]">
                                  {t.label || t.city}
                                </span>
                                <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                                  {t.formatted}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="text-[10px] text-muted-foreground text-center">
                            {bestCallInfo.awakeOverlapCount}h of shared awake time (8am–10pm)
                          </div>
                        </>
                      ) : (
                        <div className="text-[11px] text-muted-foreground text-center">
                          No shared awake hours — consider an async message
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add city — outside scroll so dropdown isn't clipped */}
      {compareSlots.length < 5 && (
        <div className="relative px-3 pb-2 pt-1 shrink-0 space-y-1.5">
          {myCity && !alreadyHasMe && (
            <button
              onClick={() => onAdd(myCity)}
              className="flex items-center gap-2 w-full rounded-lg border border-dashed border-primary/30 bg-primary/5 px-2.5 py-1.5 text-sm hover:bg-primary/10 transition-colors"
            >
              <MapPin className="size-3.5 text-primary shrink-0" />
              <span className="text-primary font-medium">Add my timezone</span>
              <span className="ml-auto text-xs text-muted-foreground">{myCity.name}</span>
            </button>
          )}
          <CitySearchInline onSelect={onAdd} />
        </div>
      )}

      {/* Timeline legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground px-3 pb-2.5 shrink-0 flex-wrap">
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
        {compareSlots.length >= 2 && (
          <div className="flex items-center gap-1">
            <div className="size-2.5 rounded-sm bg-muted-foreground/15 border-t-2 border-emerald-400/60" />
            <span>Overlap</span>
          </div>
        )}
      </div>
    </div>
  );
}
