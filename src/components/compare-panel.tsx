"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  timezoneCities,
  timezoneColors,
  formatTimeInTimezone,
  formatDateInTimezone,
  formatHourAs12h,
  countryFlag,
  type TimezoneCity,
  type CompareSlot,
} from "@/lib/timezones";
import { Clock, Search, X, Link2, Check } from "lucide-react";

type Props = {
  compareSlots: CompareSlot[];
  onAdd: (city: TimezoneCity) => void;
  onRemove: (index: number) => void;
  onLabelChange: (index: number, label: string) => void;
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
  compareSlots,
  onAdd,
  onRemove,
  onLabelChange,
  onClose,
}: Props) {
  const [, setTick] = useState(0);
  const [showCopied, setShowCopied] = useState(false);

  // Update every second to keep times in sync
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const overlapInfo = computeOverlapInfo(compareSlots);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  }, []);

  return (
    <div className="pointer-events-auto w-full sm:w-80 rounded-xl border bg-background/95 backdrop-blur-md shadow-lg flex flex-col max-h-[70vh]">
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

      {/* Scrollable city list */}
      <div className="overflow-y-auto flex-1 min-h-0">
        <div className="p-3 space-y-3">
          {compareSlots.map((slot, i) => {
            const { city } = slot;
            const color = timezoneColors[city.utcOffset] || "#6366f1";
            const flag = countryFlag(city.country);
            const time = formatTimeInTimezone(city.timezone);
            const date = formatDateInTimezone(city.timezone);

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
                    <span
                      className="text-lg font-bold tabular-nums"
                      style={{ color }}
                    >
                      {time}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted-foreground">{date}</div>
                    <div className="text-[10px] font-mono text-muted-foreground/70">{city.utcOffset}</div>
                  </div>
                </div>
                <TimelineBar
                  timezone={city.timezone}
                  color={color}
                  overlapHours={overlapInfo?.overlapUtcHours}
                />
              </div>
            );
          })}

          {/* Enhanced meeting time finder */}
          {compareSlots.length >= 2 && overlapInfo && (
            <div className="rounded-md bg-muted/50 p-2.5 space-y-2">
              {overlapInfo.count > 0 ? (
                <>
                  <div className="text-xs text-muted-foreground text-center">
                    Overlap:{" "}
                    <span className="font-semibold text-foreground">
                      {overlapInfo.count}h
                    </span>
                  </div>
                  {/* Per-person overlap windows */}
                  <div className="space-y-0.5">
                    {overlapInfo.perSlot.map((ps, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground truncate max-w-[100px]">
                          {ps.label || ps.cityName}
                        </span>
                        <span className="font-mono text-foreground/80">
                          {formatHourAs12h(ps.localStart)} – {formatHourAs12h(ps.localEnd)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Best meeting slots */}
                  {overlapInfo.bestSlots.length > 0 && (
                    <div className="border-t border-border/50 pt-2 space-y-1">
                      <div className="text-[10px] text-muted-foreground font-medium">Best times:</div>
                      {overlapInfo.bestSlots.map((bs, i) => (
                        <div key={i} className="text-[10px] text-foreground/70 font-mono flex flex-wrap gap-x-2">
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
        </div>
      </div>

      {/* Add city — outside scroll so dropdown isn't clipped */}
      {compareSlots.length < 5 && (
        <div className="relative px-3 pb-2 pt-1 shrink-0">
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
