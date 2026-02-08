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
import {
  timezoneCities,
  timezoneColors,
  timezoneZoneLabels,
  formatTimeInTimezone,
  formatDateInTimezone,
  type TimezoneCity,
} from "@/lib/timezones";
import { Clock, MapPin, Globe, Search, X, Eye, EyeOff } from "lucide-react";
import { CountryTimezoneLayer } from "@/components/country-timezone-layer";

// Component that renders timezone labels pinned to bottom of screen,
// positioned horizontally to match the map's longitude projection
function TimezoneZoneLabels() {
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

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 z-10 h-16 pointer-events-none overflow-hidden"
    >
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />

      {positions.map((pos, i) => {
        if (!pos.visible) return null;

        const zone = timezoneZoneLabels[i];
        const color = timezoneColors[zone.utcOffset] || "#94a3b8";
        const time = formatTimeInTimezone(zone.timezone);
        const offsetLabel =
          zone.utcOffset === "UTC+0"
            ? "UTC"
            : zone.utcOffset.replace("UTC", "");

        return (
          <div
            key={pos.key}
            className="absolute bottom-2 -translate-x-1/2 flex flex-col items-center select-none"
            style={{ left: pos.x }}
          >
            <div
              className="rounded-md px-1.5 py-0.5 text-white font-mono font-bold text-[11px] leading-tight shadow-sm whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {time.replace(/\s?(AM|PM)/i, "")}
              <span className="text-white/70 text-[8px] ml-0.5">
                {time.includes("AM") ? "AM" : "PM"}
              </span>
            </div>
            <span
              className="text-[9px] font-mono font-semibold mt-0.5"
              style={{ color }}
            >
              {offsetLabel}
            </span>
          </div>
        );
      })}
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

  const userTime = formatTimeInTimezone(userTimezone);
  const userDate = formatDateInTimezone(userTimezone);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Map center={[20, 20]} zoom={2} minZoom={1.5} maxZoom={8}>
        <MapControls
          position="bottom-right"
          showZoom
          showLocate
          showFullscreen
        />

        {/* Country timezone fill layer */}
        <CountryTimezoneLayer />

        {/* Timezone labels pinned to bottom of screen */}
        <TimezoneZoneLabels />

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

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between gap-3 pointer-events-none">
        {/* Title + user time */}
        <div className="pointer-events-auto rounded-xl border bg-background/90 backdrop-blur-md shadow-lg p-3">
          <div className="flex items-center gap-2">
            <Globe className="size-5 text-primary" />
            <h1 className="text-base font-bold">Time Map</h1>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-sm">
            <Clock className="size-3.5 text-muted-foreground" />
            <span className="font-semibold tabular-nums">{userTime}</span>
            <span className="text-muted-foreground text-xs">
              {userDate} &middot;{" "}
              {userTimezone.split("/").pop()?.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Search + toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* City toggle */}
          <button
            onClick={() => {
              setShowCities(!showCities);
              if (!showCities === false) setSelectedCity(null);
            }}
            className="flex items-center gap-1.5 rounded-xl border bg-background/90 backdrop-blur-md shadow-lg px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors"
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
                className="w-48 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
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
