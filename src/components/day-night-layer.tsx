"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMap } from "@/components/ui/map";

const NIGHT_SOURCE = "night-source";
const NIGHT_LAYER = "night-overlay";
const TZ_LINES_LAYER = "tz-lines"; // last layer added by CountryTimezoneLayer

// Solar declination angle in radians for a given date
function solarDeclination(date: Date): number {
  const dayOfYear =
    Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
        86400000
    );
  return -23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365.25) * (Math.PI / 180);
}

// Hour angle of the sun at a given UTC time
function solarHourAngle(date: Date): number {
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  return (12 - hours) * 15;
}

// Generate the night polygon (the dark half of the Earth)
function buildNightPolygon(date: Date): GeoJSON.Feature {
  const decl = solarDeclination(date);
  const ha = solarHourAngle(date);

  const terminatorPoints: [number, number][] = [];
  const step = 2;

  for (let lng = -180; lng <= 180; lng += step) {
    const lngRad = (lng - ha) * (Math.PI / 180);
    const latRad = Math.atan(-Math.cos(lngRad) / Math.tan(decl));
    const lat = latRad * (180 / Math.PI);
    terminatorPoints.push([lng, lat]);
  }

  // If declination > 0 sun is north → night is south; else night is north
  const nightOnSouth = decl > 0;
  const nightCoords: [number, number][] = [];

  if (nightOnSouth) {
    nightCoords.push([-180, -90]);
    for (const pt of terminatorPoints) nightCoords.push(pt);
    nightCoords.push([180, -90]);
    nightCoords.push([-180, -90]);
  } else {
    nightCoords.push([-180, 90]);
    for (const pt of terminatorPoints) nightCoords.push(pt);
    nightCoords.push([180, 90]);
    nightCoords.push([-180, 90]);
  }

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [nightCoords],
    },
  };
}

export function DayNightLayer({ date }: { date?: Date }) {
  const { map, isLoaded } = useMap();
  const addedRef = useRef(false);
  // rAF handle so rapid date changes (slider drag) only rebuild once per frame
  const rafRef = useRef<number | null>(null);
  // Last minute we rebuilt for, to avoid per-second-tick jitter while scrubbed
  const lastMinuteRef = useRef<number | null>(null);
  // Always holds the latest `date` prop. `updateNight`/`scheduleUpdate` read
  // through this ref (instead of closing over `date` directly) so a rAF that's
  // already in flight always resolves against the freshest value — otherwise a
  // burst of updates (e.g. clicking "Live" right after a drag) could have its
  // second, correct call coalesced away by the first call's now-stale rAF.
  const dateRef = useRef(date);
  useEffect(() => {
    dateRef.current = date;
  }, [date]);

  const updateNight = useCallback(() => {
    if (!map) return;
    const source = map.getSource(NIGHT_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    const d = dateRef.current ?? new Date();
    const minute = Math.floor(d.getTime() / 60000);
    if (lastMinuteRef.current === minute) return;
    lastMinuteRef.current = minute;
    source.setData({
      type: "FeatureCollection",
      features: [buildNightPolygon(d)],
    });
  }, [map]);

  // rAF-throttled trigger — coalesces bursts of updates (e.g. slider drag) into
  // one rebuild per animation frame instead of rebuilding the 180-point polygon
  // on every intermediate value.
  const scheduleUpdate = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateNight();
    });
  }, [updateNight]);

  useEffect(() => {
    if (!map || !isLoaded || addedRef.current) return;

    // CountryTimezoneLayer loads data async, so its layers may not exist yet.
    // Poll until tz-lines layer is ready, then insert our night overlay above it.
    function tryAdd() {
      if (!map || addedRef.current) return;

      // Wait for the tz layers to be ready
      if (!map.getLayer(TZ_LINES_LAYER)) {
        setTimeout(tryAdd, 200);
        return;
      }

      const initialDate = dateRef.current ?? new Date();
      lastMinuteRef.current = Math.floor(initialDate.getTime() / 60000);

      map.addSource(NIGHT_SOURCE, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [buildNightPolygon(initialDate)],
        },
      });

      // Find the first symbol layer to insert below map labels but above all tz layers
      const firstSymbolLayer = map
        .getStyle()
        ?.layers?.find((l) => l.type === "symbol");

      map.addLayer(
        {
          id: NIGHT_LAYER,
          type: "fill",
          source: NIGHT_SOURCE,
          paint: {
            "fill-color": "#000000",
            "fill-opacity": 0.25,
          },
        },
        firstSymbolLayer?.id
      );

      addedRef.current = true;
    }

    tryAdd();

    // Update every 60 seconds when live (no fixed date supplied)
    const interval = setInterval(scheduleUpdate, 60000);

    return () => {
      clearInterval(interval);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      try {
        if (map.getLayer(NIGHT_LAYER)) map.removeLayer(NIGHT_LAYER);
        if (map.getSource(NIGHT_SOURCE)) map.removeSource(NIGHT_SOURCE);
        addedRef.current = false;
      } catch {
        // ignore cleanup errors
      }
    };
  }, [map, isLoaded, scheduleUpdate]);

  // Rebuild the polygon whenever the viewed date changes (e.g. scrub slider drag)
  useEffect(() => {
    if (!addedRef.current) return;
    scheduleUpdate();
  }, [date, scheduleUpdate]);

  return null;
}
