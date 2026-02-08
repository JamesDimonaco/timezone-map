"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@/components/ui/map";
import { countryTimezoneMap } from "@/lib/country-timezones";
import { timezoneColors } from "@/lib/timezones";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";

// Territories that don't have an ISO numeric ID in the dataset
const nameFallbackTimezone: Record<string, string> = {
  Kosovo: "UTC+1",
  "N. Cyprus": "UTC+2",
  Somaliland: "UTC+3",
};

// IDs that cross the anti-meridian and cause rendering artifacts
const ANTIMERIDIAN_IDS = new Set(["010", "242", "643"]); // Antarctica, Fiji, Russia

const SOURCE_ID = "countries-source";
const LAYER_ID = "countries-fill";
const TZ_LINES_SOURCE = "tz-lines-source";
const TZ_LINES_LAYER = "tz-lines";

function buildTimezoneLines(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  for (let offset = -12; offset <= 12; offset++) {
    const lng = offset * 15;
    const coords: [number, number][] = [];
    for (let lat = -60; lat <= 72; lat += 2) {
      coords.push([lng, lat]);
    }
    features.push({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: coords },
    });
  }
  return { type: "FeatureCollection", features };
}

// Clip a single ring to one side of the anti-meridian
function clipRingToSide(
  ring: number[][],
  side: "east" | "west"
): number[][] | null {
  const filtered = ring.filter((coord) =>
    side === "east" ? coord[0] >= 0 : coord[0] <= 0
  );
  return filtered.length >= 3 ? filtered : null;
}

// Split a polygon/multipolygon that crosses the anti-meridian into
// separate east/west halves so MapLibre renders them correctly
function splitAntimeridianFeature(
  feature: GeoJSON.Feature
): GeoJSON.Feature[] {
  const geom = feature.geometry;
  const results: number[][][][] = [[], []]; // [east polygons, west polygons]

  const processPolygon = (rings: number[][][]) => {
    for (const ring of rings) {
      const east = clipRingToSide(ring, "east");
      const west = clipRingToSide(ring, "west");
      if (east) results[0].push(east);
      if (west) results[1].push(west);
    }
  };

  if (geom.type === "Polygon") {
    processPolygon(geom.coordinates as number[][][]);
  } else if (geom.type === "MultiPolygon") {
    for (const polygon of geom.coordinates as number[][][][]) {
      processPolygon(polygon);
    }
  }

  return results
    .filter((polys) => polys.length > 0)
    .map((polys) => ({
      ...feature,
      geometry: {
        type: "MultiPolygon" as const,
        coordinates: polys.map((ring) => [ring]),
      },
    }));
}

export function CountryTimezoneLayer() {
  const { map, isLoaded } = useMap();
  const addedRef = useRef(false);

  useEffect(() => {
    if (!map || !isLoaded || addedRef.current) return;

    async function addLayer() {
      if (!map) return;

      try {
        const res = await fetch("/world-110m.json");
        const topo: Topology = await res.json();
        const geojson = topojson.feature(
          topo,
          topo.objects.countries
        ) as GeoJSON.FeatureCollection;

        // Process features: split anti-meridian crossers, tag all with tz_color
        const processedFeatures: GeoJSON.Feature[] = [];

        for (const feature of geojson.features) {
          const id = String(feature.id ?? "");

          // Skip Antarctica entirely
          if (id === "010") continue;

          if (ANTIMERIDIAN_IDS.has(id)) {
            // Split into east/west halves
            const parts = splitAntimeridianFeature(feature);
            for (const part of parts) {
              tagFeature(part, id);
              processedFeatures.push(part);
            }
          } else {
            tagFeature(feature, id);
            processedFeatures.push(feature);
          }
        }

        const processedGeojson: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: processedFeatures,
        };

        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: processedGeojson,
        });

        // Insert fill layer below symbol layers so labels/markers sit on top
        const firstSymbolLayer = map
          .getStyle()
          ?.layers?.find((l) => l.type === "symbol");

        map.addLayer(
          {
            id: LAYER_ID,
            type: "fill",
            source: SOURCE_ID,
            paint: {
              "fill-color": [
                "case",
                ["!=", ["get", "tz_color"], ""],
                ["get", "tz_color"],
                "rgba(0,0,0,0)",
              ] as unknown as maplibregl.ExpressionSpecification,
              "fill-opacity": 0.35,
            },
          },
          firstSymbolLayer?.id
        );

        // Country borders
        map.addLayer(
          {
            id: LAYER_ID + "-border",
            type: "line",
            source: SOURCE_ID,
            paint: {
              "line-color": "rgba(200, 200, 220, 0.25)",
              "line-width": 0.8,
            },
          },
          firstSymbolLayer?.id
        );

        // Timezone boundary lines (native GeoJSON layer, no MapRoute artifacts)
        map.addSource(TZ_LINES_SOURCE, {
          type: "geojson",
          data: buildTimezoneLines(),
        });

        map.addLayer(
          {
            id: TZ_LINES_LAYER,
            type: "line",
            source: TZ_LINES_SOURCE,
            paint: {
              "line-color": "rgba(148, 163, 184, 0.3)",
              "line-width": 1,
              "line-dasharray": [4, 4],
            },
          },
          firstSymbolLayer?.id
        );

        addedRef.current = true;
      } catch (err) {
        console.error("Failed to load country timezone layer:", err);
      }
    }

    addLayer();

    return () => {
      try {
        if (map.getLayer(TZ_LINES_LAYER)) map.removeLayer(TZ_LINES_LAYER);
        if (map.getSource(TZ_LINES_SOURCE)) map.removeSource(TZ_LINES_SOURCE);
        if (map.getLayer(LAYER_ID + "-border"))
          map.removeLayer(LAYER_ID + "-border");
        if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
        addedRef.current = false;
      } catch {
        // ignore cleanup errors
      }
    };
  }, [map, isLoaded]);

  return null;
}

function tagFeature(feature: GeoJSON.Feature, id: string) {
  const name = (feature.properties?.name as string) ?? "";
  let tzKey = countryTimezoneMap[id];
  if (!tzKey && name) {
    tzKey = nameFallbackTimezone[name];
  }
  feature.properties = {
    ...feature.properties,
    tz_color: (tzKey && timezoneColors[tzKey]) || "",
  };
}
