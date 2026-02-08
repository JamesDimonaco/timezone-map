"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMap } from "@/components/ui/map";

const NIGHT_SOURCE = "night-source";
const NIGHT_LAYER = "night-overlay";

// Solar declination angle in radians for a given date
function solarDeclination(date: Date): number {
  const dayOfYear =
    Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
        86400000
    );
  // Approximate declination
  return -23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365.25) * (Math.PI / 180);
}

// Hour angle of the sun at a given UTC time
function solarHourAngle(date: Date): number {
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  // Sun is at longitude = (12 - hours) * 15
  return (12 - hours) * 15;
}

// Generate the night polygon (the dark half of the Earth)
function buildNightPolygon(date: Date): GeoJSON.Feature {
  const decl = solarDeclination(date);
  const ha = solarHourAngle(date);

  // Calculate terminator line: for each longitude, find the latitude where sun is at horizon
  // cos(lat) * cos(decl) * cos(lng - ha) + sin(lat) * sin(decl) = 0
  // => tan(lat) = -cos(lng - ha) * cos(decl) / sin(decl)
  // => lat = atan(-cos(lng - ha) / tan(decl))

  const terminatorPoints: [number, number][] = [];
  const step = 2;

  for (let lng = -180; lng <= 180; lng += step) {
    const lngRad = (lng - ha) * (Math.PI / 180);
    const latRad = Math.atan(-Math.cos(lngRad) / Math.tan(decl));
    const lat = latRad * (180 / Math.PI);
    terminatorPoints.push([lng, lat]);
  }

  // Determine which side is night: check if the subsolar point is north or south
  // If declination > 0, sun is in northern hemisphere
  // The night polygon should be on the opposite side of the terminator from the sun
  const nightOnSouth = decl > 0;

  // Build polygon: terminator + cap at the pole on the night side
  const nightCoords: [number, number][] = [];

  if (nightOnSouth) {
    // Night is south of the terminator
    // Go along terminator from west to east, then close along the south pole
    nightCoords.push([-180, -90]);
    for (let i = 0; i < terminatorPoints.length; i++) {
      nightCoords.push(terminatorPoints[i]);
    }
    nightCoords.push([180, -90]);
    nightCoords.push([-180, -90]); // close
  } else {
    // Night is north of the terminator
    nightCoords.push([-180, 90]);
    for (let i = 0; i < terminatorPoints.length; i++) {
      nightCoords.push(terminatorPoints[i]);
    }
    nightCoords.push([180, 90]);
    nightCoords.push([-180, 90]); // close
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

export function DayNightLayer() {
  const { map, isLoaded } = useMap();
  const addedRef = useRef(false);

  const updateNight = useCallback(() => {
    if (!map) return;
    const source = map.getSource(NIGHT_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData({
      type: "FeatureCollection",
      features: [buildNightPolygon(new Date())],
    });
  }, [map]);

  useEffect(() => {
    if (!map || !isLoaded || addedRef.current) return;

    // Add night overlay source + layer
    map.addSource(NIGHT_SOURCE, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [buildNightPolygon(new Date())],
      },
    });

    // Find the first symbol layer to insert below labels
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
          "fill-opacity": 0.18,
        },
      },
      firstSymbolLayer?.id
    );

    // Update every 60 seconds
    const interval = setInterval(updateNight, 60000);

    addedRef.current = true;

    return () => {
      clearInterval(interval);
      try {
        if (map.getLayer(NIGHT_LAYER)) map.removeLayer(NIGHT_LAYER);
        if (map.getSource(NIGHT_SOURCE)) map.removeSource(NIGHT_SOURCE);
        addedRef.current = false;
      } catch {
        // ignore cleanup errors
      }
    };
  }, [map, isLoaded, updateNight]);

  return null;
}
