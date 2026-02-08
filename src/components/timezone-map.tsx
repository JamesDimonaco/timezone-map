"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  formatTimeInTimezone,
  formatDateInTimezone,
  countryFlag,
  type TimezoneCity,
} from "@/lib/timezones";
import { Clock, MapPin, Globe, Search, X, Eye, EyeOff, GitCompareArrows } from "lucide-react";
import {
  CountryTimezoneLayer,
  type TzHoverInfo,
  type CountryClickInfo,
} from "@/components/country-timezone-layer";
import { DayNightLayer } from "@/components/day-night-layer";
import { ComparePanel } from "@/components/compare-panel";

// Component that renders timezone labels pinned to bottom of screen,
// positioned horizontally to match the map's longitude projection
function TimezoneZoneLabels({
  highlightColor,
  onLabelHover,
  onLabelClick,
}: {
  highlightColor: string | null;
  onLabelHover?: (color: string | null) => void;
  onLabelClick?: (color: string) => void;
}) {
  const { map, isLoaded } = useMap();
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<
    { key: string; x: number; visible: boolean }[]
  >([]);

  const updatePositions = useCallback(() => {
    if (!map) return;

    const container = map.getContainer();
    const width = container.offsetWidth;

    const newPositions = timezoneZoneLabels.map((zone) => {
      // Place label at the CENTER of the zone (midpoint between this line and the next)
      const centerLng = zone.lng + 7.5;
      const point = map.project([centerLng, 0]);
      return {
        key: zone.utcOffset,
        x: point.x,
        visible: point.x > -30 && point.x < width + 30,
      };
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

  // Calculate the midnight line position (where local time = 00:00)
  const [midnightX, setMidnightX] = useState<number | null>(null);
  const [midnightDates, setMidnightDates] = useState<{
    left: string;
    right: string;
  }>({ left: "", right: "" });

  const updateMidnight = useCallback(() => {
    if (!map) return;
    const now = new Date();
    const utcH = now.getUTCHours();
    const utcM = now.getUTCMinutes();
    const utcS = now.getUTCSeconds();
    // Midnight occurs where UTC offset = -(utcH + utcM/60 + utcS/3600)
    const midnightOffset = -(utcH + utcM / 60 + utcS / 3600);
    // Normalize longitude to -180..180
    let midnightLng = midnightOffset * 15;
    if (midnightLng < -180) midnightLng += 360;
    if (midnightLng > 180) midnightLng -= 360;

    const container = map.getContainer();
    const width = container.offsetWidth;
    const point = map.project([midnightLng, 0]);

    // Only show if on-screen
    if (point.x >= -60 && point.x <= width + 60) {
      setMidnightX(point.x);
    } else {
      setMidnightX(null);
    }

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
    const interval = setInterval(updateMidnight, 1000);
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

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 z-10 h-16 sm:h-20 pointer-events-none overflow-hidden"
    >

      {/* Midnight date line island */}
      {midnightX !== null && (
        <div
          className="absolute bottom-0 z-20 flex flex-col items-center select-none"
          style={{ left: midnightX, transform: "translateX(-50%)" }}
        >
          {/* Vertical midnight line */}
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-amber-400/50 to-amber-400/80" />
          {/* Pulsing dot */}
          <div className="relative -mt-px">
            <div className="absolute -inset-1 rounded-full bg-amber-400/30 animate-ping" />
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
      )}

      {positions.map((pos, i) => {
        if (!pos.visible) return null;

        const zone = timezoneZoneLabels[i];
        const color = timezoneColors[zone.utcOffset] || "#94a3b8";
        const time = formatTimeInTimezone(zone.timezone);
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
function TzTooltip({ info }: { info: TzHoverInfo }) {
  if (!info) return null;

  const time = formatTimeInTimezone(
    // Use a city timezone for the offset if possible, fall back to tzid
    info.tzid || "UTC"
  );
  const date = formatDateInTimezone(info.tzid || "UTC");

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
}

// Country info popup on click
function CountryPopup({
  info,
  onClose,
}: {
  info: CountryClickInfo;
  onClose: () => void;
}) {
  if (!info) return null;

  const flag = countryFlag(info.name);
  const time = info.tzid ? formatTimeInTimezone(info.tzid) : "";
  const date = info.tzid ? formatDateInTimezone(info.tzid) : "";
  const regionName = info.tzid?.split("/").pop()?.replace(/_/g, " ") || "";

  return (
    <div className="fixed bottom-24 right-2 sm:right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <Card className="w-64 p-0 shadow-xl border bg-background/95 backdrop-blur-md overflow-hidden">
        <div className="p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {flag && <span className="text-lg">{flag}</span>}
              <h3 className="font-semibold text-sm">{info.name}</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-0.5 hover:bg-muted transition-colors"
            >
              <X className="size-3.5 text-muted-foreground" />
            </button>
          </div>

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

          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="size-3" />
            {Math.abs(info.lngLat.lat).toFixed(1)}&deg;{info.lngLat.lat >= 0 ? "N" : "S"},{" "}
            {Math.abs(info.lngLat.lng).toFixed(1)}&deg;{info.lngLat.lng >= 0 ? "E" : "W"}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function TimezoneMap() {
  const [, setNow] = useState(new Date());
  const [selectedCity, setSelectedCity] = useState<TimezoneCity | null>(null);
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
  const [countryClick, setCountryClick] = useState<CountryClickInfo>(null);

  // Label interaction state
  const [labelHoverColor, setLabelHoverColor] = useState<string | null>(null);
  const [lockedColor, setLockedColor] = useState<string | null>(null);

  // Compare panel state
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareCities, setCompareCities] = useState<TimezoneCity[]>([]);

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
    if (compareParam) {
      const names = compareParam.split(",").map((n) => n.trim());
      const matched: TimezoneCity[] = [];
      for (const name of names) {
        const city = timezoneCities.find(
          (c) => c.name.toLowerCase() === name.toLowerCase()
        );
        if (city && matched.length < 5) matched.push(city);
      }
      if (matched.length > 0) {
        setCompareCities(matched);
        setCompareOpen(true);
      }
    }
  }, []);

  // Update URL when compare cities change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (compareCities.length > 0) {
      url.searchParams.set(
        "compare",
        compareCities.map((c) => c.name).join(",")
      );
    } else {
      url.searchParams.delete("compare");
    }
    window.history.replaceState({}, "", url.toString());
  }, [compareCities]);

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

  const filteredCities = searchQuery.trim()
    ? timezoneCities.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.utcOffset.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleCitySelect = useCallback((city: TimezoneCity) => {
    setSelectedCity(city);
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  const handleCompareAdd = useCallback((city: TimezoneCity) => {
    setCompareCities((prev) => {
      if (prev.length >= 5) return prev;
      if (prev.some((c) => c.name === city.name && c.country === city.country)) return prev;
      return [...prev, city];
    });
  }, []);

  const handleCompareRemove = useCallback((index: number) => {
    setCompareCities((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCountryClick = useCallback((info: CountryClickInfo) => {
    setCountryClick(info);
  }, []);

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

  // Effective highlight: label hover takes priority, then locked color
  const effectiveMapHighlight = labelHoverColor || lockedColor || null;
  // For labels: show highlight from any source (label hover, locked, or map hover)
  const effectiveLabelHighlight =
    labelHoverColor || lockedColor || (tzHover?.tzColor ?? null);

  const userTime = formatTimeInTimezone(userTimezone);
  const userDate = formatDateInTimezone(userTimezone);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
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
        />

        {/* Country timezone fill layer */}
        <CountryTimezoneLayer
          onTzHover={setTzHover}
          onCountryClick={handleCountryClick}
          highlightColor={effectiveMapHighlight}
          onMapInteract={handleMapInteract}
        />

        {/* Day/night shadow overlay */}
        <DayNightLayer />

        {/* Timezone labels pinned to bottom of screen */}
        <TimezoneZoneLabels
          highlightColor={effectiveLabelHighlight}
          onLabelHover={handleLabelHover}
          onLabelClick={handleLabelClick}
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
            const isSelected = selectedCity?.name === city.name;

            return (
              <MapMarker
                key={`${city.name}-${city.country}`}
                longitude={city.lng}
                latitude={city.lat}
                onClick={() => setSelectedCity(isSelected ? null : city)}
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

                {isSelected && (
                  <MarkerPopup className="w-56 p-0" closeButton>
                    <div className="space-y-2 p-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          {city.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono"
                          style={{
                            backgroundColor: color + "20",
                            color: color,
                            borderColor: color + "40",
                          }}
                        >
                          {city.utcOffset}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {city.country}
                      </div>

                      <div className="rounded-md bg-muted/50 p-2">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-muted-foreground" />
                          <span className="text-lg font-bold tabular-nums">
                            {formatTimeInTimezone(city.timezone)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatDateInTimezone(city.timezone)}
                        </p>
                      </div>

                      <div className="border-t pt-2 text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Your time:
                        </span>{" "}
                        {userTime} (
                        {userTimezone.split("/").pop()?.replace("_", " ")})
                      </div>
                    </div>
                  </MarkerPopup>
                )}
              </MapMarker>
            );
          })}
      </Map>

      {/* Compare panel */}
      {compareOpen && (
        <div
          className="absolute top-14 sm:top-20 left-0 sm:left-4 right-0 sm:right-auto z-20 px-2 sm:px-0"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <ComparePanel
            compareCities={compareCities}
            onAdd={handleCompareAdd}
            onRemove={handleCompareRemove}
            onClose={() => setCompareOpen(false)}
          />
        </div>
      )}

      {/* Timezone hover tooltip (hidden on touch devices) */}
      <div className="hidden sm:block">
        <TzTooltip info={tzHover} />
      </div>

      {/* Country click popup */}
      <CountryPopup info={countryClick} onClose={() => setCountryClick(null)} />

      {/* Top bar */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-20 flex items-start justify-between gap-2 sm:gap-3 pointer-events-none">
        {/* Title + user time */}
        <div className="pointer-events-auto rounded-xl border bg-background/90 backdrop-blur-md shadow-lg p-2 sm:p-3">
          <div className="flex items-center gap-2">
            <Globe className="size-4 sm:size-5 text-primary" />
            <h2 className="text-sm sm:text-base font-bold">Time Map</h2>
          </div>
          <div className="mt-1 sm:mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm">
            <Clock className="size-3 sm:size-3.5 text-muted-foreground" />
            <span className="font-semibold tabular-nums">{userTime}</span>
            <span className="text-muted-foreground text-[10px] sm:text-xs hidden sm:inline">
              {userDate} &middot;{" "}
              {userTimezone.split("/").pop()?.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Search + toggle */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Compare toggle */}
          <button
            onClick={() => setCompareOpen(!compareOpen)}
            className={`flex items-center gap-1.5 rounded-xl border bg-background/90 backdrop-blur-md shadow-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm hover:bg-muted/50 transition-colors ${compareOpen ? "ring-2 ring-primary/50" : ""}`}
            title="Compare times"
          >
            <GitCompareArrows className="size-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Compare
            </span>
          </button>

          {/* City toggle */}
          <button
            onClick={() => {
              setShowCities(!showCities);
              if (!showCities === false) setSelectedCity(null);
            }}
            className="flex items-center gap-1.5 rounded-xl border bg-background/90 backdrop-blur-md shadow-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm hover:bg-muted/50 transition-colors"
            title={showCities ? "Hide cities" : "Show cities"}
          >
            {showCities ? (
              <Eye className="size-4 text-muted-foreground" />
            ) : (
              <EyeOff className="size-4 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Cities
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
