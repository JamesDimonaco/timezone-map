"use client";

import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
  useMap,
} from "@/components/ui/map";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  timezoneCities,
  timezoneColors,
  timezoneZoneLabels,
  searchCities,
  formatTimeInTimezone,
  formatDateInTimezone,
  countryFlag,
  getUtcOffsetKey,
  type TimezoneCity,
  type CompareSlot,
} from "@/lib/timezones";
import { Clock, MapPin, Globe, Search, X, Eye, EyeOff, GitCompareArrows, ExternalLink, GripHorizontal, RotateCcw } from "lucide-react";
import {
  CountryTimezoneLayer,
  type TzHoverInfo,
  type CountryClickInfo,
} from "@/components/country-timezone-layer";
import Link from "next/link";
import { cityToSlug } from "@/lib/slugs";
import { DayNightLayer } from "@/components/day-night-layer";
import { ComparePanel, type PinnedTime } from "@/components/compare-panel";
import { usePresence } from "@/hooks/use-presence";
import { LiveUsersLayer } from "@/components/live-users-layer";
import { ActiveUsersBadge } from "@/components/active-users-badge";
import { usePostHog } from "posthog-js/react";

// Component that renders timezone labels pinned to bottom of screen,
// positioned horizontally to match the map's longitude projection
function TimezoneZoneLabels({
  highlightColor,
  onLabelHover,
  onLabelClick,
  date,
}: {
  highlightColor: string | null;
  onLabelHover?: (color: string | null) => void;
  onLabelClick?: (color: string) => void;
  /** Viewed moment; null/undefined = live now */
  date: Date | null;
}) {
  const { map, isLoaded } = useMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<
    { key: string; x: number; visible: boolean; zoneIndex: number }[]
  >([]);

  const updatePositions = useCallback(() => {
    if (!map) return;

    const container = map.getContainer();
    const width = container.offsetWidth;

    // With world copies, render labels for multiple copies (±360° offsets)
    const newPositions: { key: string; x: number; visible: boolean; zoneIndex: number }[] = [];
    timezoneZoneLabels.forEach((zone, i) => {
      const centerLng = zone.lng + 7.5;
      for (const lngOffset of [-720, -360, 0, 360, 720]) {
        const point = map.project([centerLng + lngOffset, 0]);
        if (point.x > -30 && point.x < width + 30) {
          newPositions.push({
            key: `${zone.utcOffset}_${lngOffset}`,
            x: point.x,
            visible: true,
            zoneIndex: i,
          });
        }
      }
    });

    setPositions(newPositions);
  }, [map]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    updatePositions();

    map.on("move", updatePositions);
    map.on("zoom", updatePositions);
    map.on("resize", updatePositions);

    return () => {
      map.off("move", updatePositions);
      map.off("zoom", updatePositions);
      map.off("resize", updatePositions);
    };
  }, [map, isLoaded, updatePositions]);

  // Pre-compute label times — only recalculate every 10s (minute display doesn't need 1s updates).
  // When scrubbing (date is non-null), bypass the throttle and compute directly in render
  // so dragging the slider feels live.
  const labelTimesRef = useRef<string[]>(timezoneZoneLabels.map((z) => formatTimeInTimezone(z.timezone)));
  useEffect(() => {
    if (date) return; // scrubbed — computed directly below instead
    const update = () => {
      labelTimesRef.current = timezoneZoneLabels.map((z) => formatTimeInTimezone(z.timezone));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [date]);

  const labelTimes = date
    ? timezoneZoneLabels.map((z) => formatTimeInTimezone(z.timezone, date))
    : labelTimesRef.current;

  // Calculate the midnight line position (where local time = 00:00)
  const [midnightPositions, setMidnightPositions] = useState<number[]>([]);
  const [midnightDates, setMidnightDates] = useState<{
    left: string;
    right: string;
  }>({ left: "", right: "" });

  // Kept in a ref so `updateMidnight`'s identity stays stable across date changes
  // (avoids re-subscribing map listeners / re-running the mount effect every scrub tick).
  const dateRef = useRef(date);
  dateRef.current = date;

  const updateMidnight = useCallback(() => {
    if (!map) return;
    const now = dateRef.current ?? new Date();
    const utcH = now.getUTCHours();
    const utcM = now.getUTCMinutes();
    const utcS = now.getUTCSeconds();
    // Midnight occurs where UTC offset = -(utcH + utcM/60 + utcS/3600)
    const midnightOffset = -(utcH + utcM / 60 + utcS / 3600);
    let midnightLng = midnightOffset * 15;
    if (midnightLng < -180) midnightLng += 360;
    if (midnightLng > 180) midnightLng -= 360;

    const container = map.getContainer();
    const width = container.offsetWidth;

    // Render midnight line across world copies
    const visible: number[] = [];
    for (const lngOffset of [-720, -360, 0, 360, 720]) {
      const point = map.project([midnightLng + lngOffset, 0]);
      if (point.x >= -60 && point.x <= width + 60) {
        visible.push(point.x);
      }
    }
    setMidnightPositions(visible);

    // West of midnight = current date, East of midnight = next date
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
    setMidnightDates({ left: fmt(now), right: fmt(tomorrow) });
  }, [map]);

  useEffect(() => {
    if (!map || !isLoaded) return;
    updateMidnight();
    const interval = setInterval(updateMidnight, 10000);
    map.on("move", updateMidnight);
    map.on("zoom", updateMidnight);
    map.on("resize", updateMidnight);
    return () => {
      clearInterval(interval);
      map.off("move", updateMidnight);
      map.off("zoom", updateMidnight);
      map.off("resize", updateMidnight);
    };
  }, [map, isLoaded, updateMidnight]);

  // While scrubbing, recompute immediately on every date change so the amber
  // midnight island tracks the slider live (the 10s interval above is too slow).
  useEffect(() => {
    if (!date) return;
    updateMidnight();
  }, [date, updateMidnight]);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 z-10 h-16 sm:h-20 pointer-events-none overflow-hidden"
    >

      {/* Midnight date line island(s) — rendered for each visible world copy */}
      {midnightPositions.map((mx, idx) => (
        <div
          key={`midnight-${idx}`}
          className="absolute bottom-0 z-20 flex flex-col items-center select-none"
          style={{ left: mx, transform: "translateX(-50%)" }}
        >
          {/* Vertical midnight line */}
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-amber-400/50 to-amber-400/80" />
          {/* Pulsing dot */}
          <div className="relative -mt-px">
            {idx === 0 && <div className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping" />}
            <div className="size-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
          </div>
          {/* Date labels */}
          <div className="flex items-center gap-0 mt-0.5">
            <span className="text-[8px] font-mono text-amber-300/80 mr-2.5 whitespace-nowrap">
              {midnightDates.left}
            </span>
            <span className="text-[7px] text-amber-400/60 font-bold">|</span>
            <span className="text-[8px] font-mono text-amber-300/80 ml-2.5 whitespace-nowrap">
              {midnightDates.right}
            </span>
          </div>
        </div>
      ))}

      {positions.map((pos) => {
        if (!pos.visible) return null;

        const zone = timezoneZoneLabels[pos.zoneIndex];
        const color = timezoneColors[zone.utcOffset] || "#94a3b8";
        const time = labelTimes[pos.zoneIndex];
        const offsetLabel =
          zone.utcOffset === "UTC+0"
            ? "UTC"
            : zone.utcOffset.replace("UTC", "");

        const isHighlighted = highlightColor === color;

        return (
          <div
            key={pos.key}
            className="absolute bottom-1 sm:bottom-2 -translate-x-1/2 flex flex-col items-center select-none pointer-events-auto cursor-pointer transition-all duration-150"
            style={{
              left: pos.x,
              transform: `translateX(-50%) ${isHighlighted ? "scale(1.25) translateY(-4px)" : ""}`,
              zIndex: isHighlighted ? 20 : 1,
            }}
            onMouseEnter={() => onLabelHover?.(color)}
            onMouseLeave={() => onLabelHover?.(null)}
            onClick={() => onLabelClick?.(color)}
          >
            <div
              className="rounded-md px-1 sm:px-1.5 py-0.5 text-white font-mono font-bold text-[9px] sm:text-[11px] leading-tight shadow-sm whitespace-nowrap transition-all duration-150"
              style={{
                backgroundColor: color,
                boxShadow: isHighlighted
                  ? `0 0 12px ${color}88, 0 2px 8px rgba(0,0,0,0.3)`
                  : undefined,
              }}
            >
              {time.replace(/\s?(AM|PM)/i, "")}
              <span className="text-white/70 text-[8px] ml-0.5">
                {time.includes("AM") ? "AM" : "PM"}
              </span>
            </div>
            <span
              className="text-[7px] sm:text-[9px] font-mono font-semibold mt-0.5 transition-all duration-150"
              style={{
                color,
                opacity: isHighlighted ? 1 : 0.8,
              }}
            >
              {offsetLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Floating tooltip for timezone hover
const TzTooltip = memo(function TzTooltip({
  info,
  viewedDate,
}: {
  info: TzHoverInfo;
  /** Viewed moment; null = live now */
  viewedDate: Date | null;
}) {
  if (!info) return null;

  const time = formatTimeInTimezone(
    // Use a city timezone for the offset if possible, fall back to tzid
    info.tzid || "UTC",
    viewedDate ?? undefined
  );
  const date = formatDateInTimezone(info.tzid || "UTC", viewedDate ?? undefined);

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: info.point.x + 12,
        top: info.point.y - 12,
      }}
    >
      <div className="rounded-lg border bg-background/95 backdrop-blur-md shadow-lg px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="size-2.5 rounded-full shrink-0"
            style={{ backgroundColor: info.tzColor }}
          />
          <span className="font-semibold tabular-nums">{time}</span>
          <span className="text-muted-foreground text-xs">{date}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {info.utcOffset}
          {info.tzid && info.tzid !== "Etc/UTC" && (
            <span className="ml-1.5">
              {info.tzid.split("/").pop()?.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

// Unified popup info type
type PopupInfo = {
  countryName: string;
  lngLat: { lng: number; lat: number };
  tzid: string;
  utcOffset: string;
  tzColor: string;
  city: TimezoneCity | null;
} | null;

// Draggable unified popup card
const UnifiedPopup = memo(function UnifiedPopup({
  info,
  onClose,
  onCompareAdd,
  viewedDate,
}: {
  info: PopupInfo;
  onClose: () => void;
  onCompareAdd?: (city: TimezoneCity) => void;
  /** Viewed moment; null = live now */
  viewedDate: Date | null;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const startRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);

  // Reset position when popup changes
  useEffect(() => {
    offsetRef.current = { x: 0, y: 0 };
    if (cardRef.current) {
      cardRef.current.style.transform = "";
    }
  }, [info?.city?.name, info?.countryName]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = true;
    startRef.current = {
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    offsetRef.current = { x: dx, y: dy };
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  if (!info) return null;

  const flag = countryFlag(info.countryName);
  const timezone = info.city?.timezone || info.tzid || "UTC";
  const time = formatTimeInTimezone(timezone, viewedDate ?? undefined);
  const date = formatDateInTimezone(timezone, viewedDate ?? undefined);
  const regionName = info.tzid?.split("/").pop()?.replace(/_/g, " ") || "";

  return (
    <div className="fixed bottom-24 right-2 sm:right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <Card
        ref={cardRef}
        className="w-64 p-0 shadow-xl border bg-background/95 backdrop-blur-md overflow-hidden will-change-transform"
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing border-b border-border/50 hover:bg-muted/30 transition-colors"
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <GripHorizontal className="size-4 text-muted-foreground/50" />
        </div>

        <div className="p-3 space-y-2.5">
          {/* Header: flag + country name + close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {flag && <span className="text-lg">{flag}</span>}
              <h3 className="font-semibold text-sm">{info.countryName}</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-0.5 hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="size-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* City name row with colored UTC badge (city clicks only) */}
          {info.city && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{info.city.name}</span>
              <Badge
                variant="secondary"
                className="text-[10px] font-mono"
                style={{
                  backgroundColor: info.tzColor + "20",
                  color: info.tzColor,
                  borderColor: info.tzColor + "40",
                }}
              >
                {info.utcOffset}
              </Badge>
            </div>
          )}

          {/* Time card */}
          {info.tzid && (
            <div className="rounded-md bg-muted/50 p-2.5">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-lg font-bold tabular-nums">{time}</span>
                {info.tzColor && (
                  <div
                    className="size-2.5 rounded-full ml-auto shrink-0"
                    style={{ backgroundColor: info.tzColor }}
                  />
                )}
              </div>
              <div className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                <span>{date}</span>
                <span className="font-mono">{info.utcOffset}</span>
              </div>
              {regionName && (
                <div className="mt-1 text-[11px] text-muted-foreground/70">
                  {regionName}
                </div>
              )}
            </div>
          )}

          {/* Coordinates */}
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="size-3" />
            {Math.abs(info.lngLat.lat).toFixed(1)}&deg;{info.lngLat.lat >= 0 ? "N" : "S"},{" "}
            {Math.abs(info.lngLat.lng).toFixed(1)}&deg;{info.lngLat.lng >= 0 ? "E" : "W"}
          </div>

          {/* City-only actions: View details + Add to compare */}
          {info.city && (
            <div className="flex items-center gap-2 border-t pt-2">
              <Link
                href={`/time/${cityToSlug(info.city.name)}`}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="size-3" />
                View details
              </Link>
              <button
                onClick={() => info.city && onCompareAdd?.(info.city)}
                className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <GitCompareArrows className="size-3" />
                Compare
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
});

// Scrub range: ±12h from now, in minute increments
const SCRUB_MIN_MS = -12 * 60 * 60 * 1000;
const SCRUB_MAX_MS = 12 * 60 * 60 * 1000;
const SCRUB_STEP_MS = 5 * 60 * 1000;

// Format a signed offset in ms as "+3h", "-45m", "+1h30m", "now"
function formatOffsetDelta(offsetMs: number): string {
  if (offsetMs === 0) return "now";
  const sign = offsetMs > 0 ? "+" : "-";
  const abs = Math.abs(offsetMs);
  const hours = Math.floor(abs / (60 * 60 * 1000));
  const minutes = Math.round((abs % (60 * 60 * 1000)) / (60 * 1000));
  if (hours === 0) return `${sign}${minutes}m`;
  if (minutes === 0) return `${sign}${hours}h`;
  return `${sign}${hours}h${minutes}m`;
}

// Thin scrub slider for viewing world time at an offset from now. Desktop-only —
// mobile still honors a shared ?t= link, it just doesn't show the control.
function TimeScrubControl({
  offsetMs,
  viewedDate,
  onChange,
  onReset,
}: {
  offsetMs: number | null;
  viewedDate: Date;
  onChange: (offsetMs: number) => void;
  onReset: () => void;
}) {
  const isScrubbed = offsetMs !== null;
  const deltaLabel = isScrubbed ? formatOffsetDelta(offsetMs) : "Live";
  const viewedLabel = viewedDate.toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className={`hidden sm:flex pointer-events-auto items-center gap-2.5 rounded-xl border shadow-lg px-3 py-2 backdrop-blur-md transition-colors animate-in slide-in-from-bottom-4 fade-in duration-200 motion-reduce:animate-none ${
        isScrubbed
          ? "bg-amber-500/10 border-amber-400/40"
          : "bg-background/90"
      }`}
    >
      <button
        onClick={onReset}
        disabled={!isScrubbed}
        title="Reset to live time"
        aria-label="Reset to live time"
        className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors ${
          isScrubbed
            ? "text-amber-500 hover:bg-amber-500/15"
            : "text-muted-foreground/60 cursor-default"
        }`}
      >
        <RotateCcw className="size-3" />
        Live
      </button>

      <input
        type="range"
        min={SCRUB_MIN_MS}
        max={SCRUB_MAX_MS}
        step={SCRUB_STEP_MS}
        value={offsetMs ?? 0}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        aria-label="Scrub viewed time, plus or minus 12 hours from now"
        className={`w-40 motion-reduce:transition-none ${
          isScrubbed ? "accent-amber-400" : "accent-primary"
        }`}
      />

      <span className="text-xs font-mono tabular-nums text-muted-foreground whitespace-nowrap min-w-[7.5rem] text-right">
        {viewedLabel} &middot;{" "}
        <span className={isScrubbed ? "text-amber-500 font-semibold" : ""}>
          {deltaLabel}
        </span>
      </span>
    </div>
  );
}

export function TimezoneMap() {
  const posthog = usePostHog();
  const [now, setNow] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [showCities, setShowCities] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Hover/click state for map layers
  const [tzHover, setTzHover] = useState<TzHoverInfo>(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo>(null);

  // Timestamp of last city marker click — prevents the map's country click
  // handler from overwriting the city popup (both events fire on same click)
  const cityClickTsRef = useRef(0);

  // Label interaction state
  const [labelHoverColor, setLabelHoverColor] = useState<string | null>(null);
  const [lockedColor, setLockedColor] = useState<string | null>(null);

  // Compare panel state
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareSlots, setCompareSlots] = useState<CompareSlot[]>([]);
  const [pinnedTime, setPinnedTime] = useState<PinnedTime | null>(null);

  // Viewed-moment scrub state (?t=<offsetMs>). null = live now. Stored as an
  // offset from `now` (not an absolute timestamp) so the clock keeps ticking
  // under a fixed scrub position instead of freezing.
  const [viewedOffsetMs, setViewedOffsetMs] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("t");
    if (raw === null) return null;
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return null;
    return Math.min(SCRUB_MAX_MS, Math.max(SCRUB_MIN_MS, parsed));
  });
  const viewedDate = viewedOffsetMs === null ? now : new Date(now.getTime() + viewedOffsetMs);

  // Presence heartbeat
  usePresence(userLocation, userTimezone);

  // Deep linking: parse ?compare=London,Tokyo on mount
  const [initialMapView] = useState(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const lat = params.get("lat");
    const lng = params.get("lng");
    const zoom = params.get("zoom");
    if (lat && lng) {
      return {
        center: [parseFloat(lng), parseFloat(lat)] as [number, number],
        zoom: zoom ? parseFloat(zoom) : 2,
      };
    }
    return null;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const compareParam = params.get("compare");
    if (compareParam !== null) {
      const entries = compareParam
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      const matched: CompareSlot[] = [];
      for (const entry of entries) {
        const colonIdx = entry.indexOf(":");
        let label: string | undefined;
        let cityName: string;
        if (colonIdx > 0) {
          label = entry.substring(0, colonIdx).trim() || undefined;
          cityName = entry.substring(colonIdx + 1).trim();
        } else {
          cityName = entry;
        }
        const city = timezoneCities.find(
          (c) => c.name.toLowerCase() === cityName.toLowerCase()
        );
        if (city && matched.length < 5) matched.push({ city, label });
      }

      setCompareOpen(true);

      if (matched.length > 0) {
        setCompareSlots(matched);

        // Restore pinned time from URL
        const timeParam = params.get("time");
        const fromParam = params.get("from");
        if (timeParam && fromParam) {
          const [h, m] = timeParam.split(":").map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            const fromCity = matched.find(
              (s) => s.city.name.toLowerCase() === fromParam.toLowerCase()
            );
            if (fromCity) {
              setPinnedTime({
                cityKey: `${fromCity.city.name}|${fromCity.city.timezone}`,
                cityName: fromCity.city.name,
                hour: h,
                minute: m,
              });
            }
          }
        }
      }
    }

    // Auto-open city popup from ?city=CityName (from "View on map" links)
    const cityParam = params.get("city");
    if (cityParam) {
      const city = timezoneCities.find(
        (c) => c.name.toLowerCase() === cityParam.toLowerCase()
      );
      if (city) {
        const utcKey = getUtcOffsetKey(city.timezone);
        const color = timezoneColors[utcKey] || timezoneColors[city.utcOffset] || "#6366f1";
        setPopupInfo({
          countryName: city.country,
          lngLat: { lng: city.lng, lat: city.lat },
          tzid: city.timezone,
          utcOffset: city.utcOffset,
          tzColor: color,
          city,
        });
      }
    }
  }, []);

  // Update URL when compare slots, pinned time, or the viewed-moment scrub change.
  // Note: `t` (this map's viewed-moment offset) and `time`/`from` (compare panel's
  // pinned conversion) are intentionally distinct axes — one scrubs the whole map's
  // "now", the other pins a single converted time within the compare panel. They
  // don't interact and neither should clobber the other.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (compareSlots.length > 0) {
      // Clean map view params when sharing a comparison — they're noise in share links
      url.searchParams.delete("lat");
      url.searchParams.delete("lng");
      url.searchParams.delete("zoom");
      const param = compareSlots
        .map((s) => (s.label ? `${s.label}:${s.city.name}` : s.city.name))
        .join(",");
      url.searchParams.set("compare", param);
    } else {
      url.searchParams.delete("compare");
    }
    if (pinnedTime) {
      url.searchParams.set(
        "time",
        `${pinnedTime.hour.toString().padStart(2, "0")}:${pinnedTime.minute.toString().padStart(2, "0")}`
      );
      url.searchParams.set("from", pinnedTime.cityName);
    } else {
      url.searchParams.delete("time");
      url.searchParams.delete("from");
    }
    if (viewedOffsetMs !== null) {
      url.searchParams.set("t", String(viewedOffsetMs));
    } else {
      url.searchParams.delete("t");
    }
    window.history.replaceState({}, "", url.toString());
  }, [compareSlots, pinnedTime, viewedOffsetMs]);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get user location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Silently fail - user denied or unavailable
        }
      );
    }
  }, []);

  const filteredCities = searchCities(searchQuery);

  const handleCitySelect = useCallback((city: TimezoneCity) => {
    const utcKey = getUtcOffsetKey(city.timezone);
    const color = timezoneColors[utcKey] || timezoneColors[city.utcOffset] || "#6366f1";
    cityClickTsRef.current = Date.now();
    posthog?.capture("city_selected", {
      city_name: city.name,
      country: city.country,
      timezone: city.timezone,
      utc_offset: city.utcOffset,
      source: "search",
    });
    setPopupInfo({
      countryName: city.country,
      lngLat: { lng: city.lng, lat: city.lat },
      tzid: city.timezone,
      utcOffset: city.utcOffset,
      tzColor: color,
      city,
    });
    setSearchOpen(false);
    setSearchQuery("");
  }, [posthog]);

  const handleCompareAdd = useCallback((city: TimezoneCity) => {
    setCompareSlots((prev) => {
      if (prev.length >= 5) return prev;
      if (prev.some((s) => s.city.name === city.name && s.city.country === city.country)) return prev;
      posthog?.capture("compare_city_added", {
        city_name: city.name,
        country: city.country,
        timezone: city.timezone,
        slot_count: prev.length + 1,
      });
      return [...prev, { city }];
    });
  }, [posthog]);

  const handleCompareRemove = useCallback((index: number) => {
    setCompareSlots((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleLabelChange = useCallback((index: number, label: string) => {
    setCompareSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, label: label.trim() || undefined } : s))
    );
  }, []);

  const handlePopupClose = useCallback(() => setPopupInfo(null), []);

  const handleCountryClick = useCallback((info: CountryClickInfo) => {
    if (!info) return;
    // Skip if a city marker was just clicked (both fire on the same click)
    if (Date.now() - cityClickTsRef.current < 200) return;
    posthog?.capture("country_clicked", {
      country_name: info.name,
      timezone: info.tzid,
      utc_offset: info.utcOffset,
    });
    setPopupInfo({
      countryName: info.name,
      lngLat: info.lngLat,
      tzid: info.tzid,
      utcOffset: info.utcOffset,
      tzColor: info.tzColor,
      city: null,
    });
  }, [posthog]);

  // When hovering a bottom label, temporarily highlight that timezone on the map
  const handleLabelHover = useCallback((color: string | null) => {
    setLabelHoverColor(color);
  }, []);

  // Clicking a bottom label toggles a locked highlight
  const handleLabelClick = useCallback((color: string) => {
    setLockedColor((prev) => (prev === color ? null : color));
  }, []);

  // When the user hovers on the map, clear any locked label highlight
  const handleMapInteract = useCallback(() => {
    setLockedColor(null);
  }, []);

  // When user clicks locate, highlight their timezone
  const handleLocate = useCallback(() => {
    const utcKey = getUtcOffsetKey(userTimezone);
    const color = utcKey ? timezoneColors[utcKey] : null;
    if (color) setLockedColor(color);
  }, [userTimezone]);

  // Effective highlight: label hover takes priority, then locked color
  const effectiveMapHighlight = labelHoverColor || lockedColor || null;
  // For labels: show highlight from any source (label hover, locked, or map hover)
  const effectiveLabelHighlight =
    labelHoverColor || lockedColor || (tzHover?.tzColor ?? null);

  const userTime = formatTimeInTimezone(userTimezone, viewedDate);
  const userDate = formatDateInTimezone(userTimezone, viewedDate);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Map
        center={initialMapView?.center ?? [20, 20]}
        zoom={initialMapView?.zoom ?? 2}
        minZoom={1.5}
        maxZoom={8}
      >
        <MapControls
          position="bottom-right"
          showZoom
          showLocate
          showFullscreen
          locateZoom={3}
          onLocate={handleLocate}
        />

        {/* Country timezone fill layer */}
        <CountryTimezoneLayer
          onTzHover={setTzHover}
          onCountryClick={handleCountryClick}
          highlightColor={effectiveMapHighlight}
          onMapInteract={handleMapInteract}
        />

        {/* Day/night shadow overlay */}
        <DayNightLayer date={viewedDate} />

        {/* Live users presence dots */}
        <LiveUsersLayer />

        {/* Timezone labels pinned to bottom of screen */}
        <TimezoneZoneLabels
          highlightColor={effectiveLabelHighlight}
          onLabelHover={handleLabelHover}
          onLabelClick={handleLabelClick}
          date={viewedOffsetMs === null ? null : viewedDate}
        />

        {/* User location marker */}
        {userLocation && (
          <MapMarker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
          >
            <MarkerContent>
              <div className="relative flex items-center justify-center">
                {/* Pulse ring */}
                <div className="absolute size-10 rounded-full bg-blue-500/20 animate-ping" />
                <div className="absolute size-7 rounded-full bg-blue-500/15" />
                {/* Dot */}
                <div className="relative size-4 rounded-full bg-blue-500 border-[3px] border-white shadow-lg" />
              </div>
            </MarkerContent>
            <MarkerPopup className="w-52 p-0">
              <div className="p-3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-blue-500" />
                  <span className="font-semibold text-sm text-foreground">
                    You are here
                  </span>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className="text-lg font-bold tabular-nums">
                      {userTime}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {userDate} &middot;{" "}
                    {userTimezone.split("/").pop()?.replace("_", " ")}
                  </p>
                </div>
              </div>
            </MarkerPopup>
          </MapMarker>
        )}

        {/* City markers */}
        {showCities &&
          timezoneCities.map((city) => {
            const color = timezoneColors[city.utcOffset] || "#6366f1";
            const isSelected = popupInfo?.city?.name === city.name && popupInfo?.city?.country === city.country;

            return (
              <MapMarker
                key={`${city.name}-${city.country}`}
                longitude={city.lng}
                latitude={city.lat}
                onClick={() => {
                  cityClickTsRef.current = Date.now();
                  if (isSelected) {
                    setPopupInfo(null);
                  } else {
                    posthog?.capture("city_selected", {
                      city_name: city.name,
                      country: city.country,
                      timezone: city.timezone,
                      utc_offset: city.utcOffset,
                      source: "map_marker",
                    });
                    setPopupInfo({
                      countryName: city.country,
                      lngLat: { lng: city.lng, lat: city.lat },
                      tzid: city.timezone,
                      utcOffset: city.utcOffset,
                      tzColor: color,
                      city,
                    });
                  }
                }}
              >
                <MarkerContent>
                  <div className="group relative flex flex-col items-center">
                    <div
                      className="rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125"
                      style={{
                        backgroundColor: color,
                        width: isSelected ? 16 : 12,
                        height: isSelected ? 16 : 12,
                      }}
                    />
                    <div className="absolute top-full mt-1 hidden group-hover:block">
                      <div
                        className="whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold text-white shadow-md"
                        style={{ backgroundColor: color }}
                      >
                        {city.name}
                      </div>
                    </div>
                  </div>
                </MarkerContent>
              </MapMarker>
            );
          })}
      </Map>

      {/* Compare panel */}
      {compareOpen && (
        <div
          className="absolute top-2 sm:top-20 right-0 sm:right-4 left-0 sm:left-auto z-30 px-2 sm:px-0"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <ComparePanel
            compareSlots={compareSlots}
            userTimezone={userTimezone}
            onAdd={handleCompareAdd}
            onRemove={handleCompareRemove}
            onLabelChange={handleLabelChange}
            onClose={() => setCompareOpen(false)}
            pinnedTime={pinnedTime}
            onPinChange={setPinnedTime}
          />
        </div>
      )}

      {/* Timezone hover tooltip (hidden on touch devices) */}
      <div className="hidden sm:block">
        <TzTooltip info={tzHover} viewedDate={viewedOffsetMs === null ? null : viewedDate} />
      </div>

      {/* Unified popup (city or country click) */}
      <UnifiedPopup
        info={popupInfo}
        onClose={handlePopupClose}
        onCompareAdd={handleCompareAdd}
        viewedDate={viewedOffsetMs === null ? null : viewedDate}
      />

      {/* Time scrub control — view world time at an offset from now (desktop-only).
          Sits above the quick-convert bar (bottom-24 sm:bottom-28) so the two never overlap. */}
      <div className="absolute bottom-40 sm:bottom-44 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <TimeScrubControl
          offsetMs={viewedOffsetMs}
          viewedDate={viewedDate}
          onChange={setViewedOffsetMs}
          onReset={() => setViewedOffsetMs(null)}
        />
      </div>

      {/* Footer credits */}
      <div className="absolute bottom-[4.5rem] sm:bottom-24 left-2 z-20 pointer-events-auto rounded-md bg-background/60 backdrop-blur-sm px-2 py-1 flex items-center gap-2 text-[11px] text-muted-foreground/70 hover:text-muted-foreground transition-colors">
        <a href="https://james.dimonaco.co.uk/" target="_blank" rel="noopener noreferrer" className="hover:underline">Built by James Dimonaco</a>
        <span>&middot;</span>
        <a href="https://github.com/JamesDimonaco/timezone-map" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          Source
        </a>
      </div>

      {/* Top bar */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-20 flex items-start justify-between gap-2 sm:gap-3 pointer-events-none">
        {/* Title + user time */}
        <div className="pointer-events-auto rounded-xl border bg-background/90 backdrop-blur-md shadow-lg p-2 sm:p-3">
          <div className="hidden sm:flex items-center gap-2">
            <Globe className="size-4 sm:size-5 text-primary" />
            <h2 className="text-sm sm:text-base font-bold">Time Map</h2>
          </div>
          <div className="sm:mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm">
            <Clock className="size-3 sm:size-3.5 text-muted-foreground" />
            <span className="font-semibold tabular-nums">{userTime}</span>
            <span className="text-muted-foreground text-[10px] sm:text-xs hidden sm:inline">
              {userDate} &middot;{" "}
              {userTimezone.split("/").pop()?.replace("_", " ")}
            </span>
          </div>
          <ActiveUsersBadge />
        </div>

        {/* Search + toggle */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Convert time / compare toggle */}
          <button
            onClick={() => setCompareOpen(!compareOpen)}
            className={`flex items-center gap-1.5 rounded-xl border shadow-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm transition-colors ${compareOpen ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-background/90 backdrop-blur-md hover:bg-muted/50 border-primary/30"}`}
            title="Convert time across cities"
            aria-label="Convert time across cities"
          >
            <Clock className="size-4" />
            <span className="text-xs font-medium hidden sm:inline">
              Convert Time
            </span>
          </button>

          {/* Pins toggle */}
          <button
            onClick={() => {
              setShowCities(!showCities);
              if (showCities) setPopupInfo(null);
            }}
            className="flex items-center gap-1.5 rounded-xl border bg-background/90 backdrop-blur-md shadow-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm hover:bg-muted/50 transition-colors"
            title={showCities ? "Hide pins" : "Show pins"}
            aria-label={showCities ? "Hide city pins" : "Show city pins"}
          >
            {showCities ? (
              <Eye className="size-4 text-muted-foreground" />
            ) : (
              <EyeOff className="size-4 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Pins
            </span>
          </button>

          {/* Search */}
          <div className="relative">
            <div className="flex items-center rounded-xl border bg-background/90 backdrop-blur-md shadow-lg">
              <Search className="size-4 ml-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                className="w-28 sm:w-48 bg-transparent px-2 py-2 sm:py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="mr-2 rounded p-0.5 hover:bg-muted"
                  aria-label="Clear search"
                >
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            {searchOpen && filteredCities.length > 0 && (
              <div className="absolute right-0 top-full mt-1 w-64 rounded-xl border bg-background/95 backdrop-blur-md shadow-lg max-h-64 overflow-y-auto">
                {filteredCities.slice(0, 8).map((city) => (
                  <button
                    key={`${city.name}-${city.country}`}
                    onClick={() => handleCitySelect(city)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div
                      className="size-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          timezoneColors[city.utcOffset] || "#6366f1",
                      }}
                    />
                    <div className="min-w-0">
                      <span className="font-medium">{city.name}</span>
                      <span className="text-muted-foreground">
                        , {city.country}
                      </span>
                    </div>
                    <span className="ml-auto text-xs font-mono text-muted-foreground shrink-0">
                      {city.utcOffset}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
