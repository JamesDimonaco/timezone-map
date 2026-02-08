"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMap } from "@/components/ui/map";
import { timezoneColors, getUtcOffsetKey } from "@/lib/timezones";
import * as topojson from "topojson-client";
import type { Topology } from "topojson-specification";

const TZ_SOURCE = "tz-source";
const TZ_FILL_LAYER = "tz-boundaries-fill";
const TZ_BORDER_LAYER = "tz-boundaries-border";
const COUNTRY_SOURCE = "country-source";
const COUNTRY_FILL_LAYER = "country-fill";
const COUNTRY_BORDER_LAYER = "country-borders";
const COUNTRY_HIGHLIGHT_LAYER = "country-highlight";
const TZ_LINES_SOURCE = "tz-lines-source";
const TZ_LINES_LAYER = "tz-lines";

export type TzHoverInfo = {
  tzColor: string;
  utcOffset: string;
  tzid: string;
  point: { x: number; y: number };
} | null;

export type CountryClickInfo = {
  name: string;
  point: { x: number; y: number };
  lngLat: { lng: number; lat: number };
  tzid: string;
  utcOffset: string;
  tzColor: string;
} | null;

type Props = {
  onTzHover?: (info: TzHoverInfo) => void;
  onCountryClick?: (info: CountryClickInfo) => void;
  highlightColor?: string | null;
  onMapInteract?: () => void;
};

// Country IDs that cross the anti-meridian and need splitting
const ANTIMERIDIAN_IDS = new Set([10, 242, 643]); // Antarctica, Fiji, Russia

function splitAntimeridianFeature(
  feature: GeoJSON.Feature
): GeoJSON.Feature[] {
  const geom = feature.geometry;
  if (geom.type !== "Polygon" && geom.type !== "MultiPolygon") {
    return [feature];
  }

  const eastPolys: number[][][] = [];
  const westPolys: number[][][] = [];

  const splitRing = (ring: number[][]) => {
    const east = ring.filter((c) => c[0] >= 0);
    const west = ring.filter((c) => c[0] < 0);
    if (east.length >= 3) eastPolys.push(east);
    if (west.length >= 3) westPolys.push(west);
  };

  if (geom.type === "Polygon") {
    for (const ring of geom.coordinates) splitRing(ring as number[][]);
  } else {
    for (const poly of geom.coordinates) {
      for (const ring of poly) splitRing(ring as number[][]);
    }
  }

  return [eastPolys, westPolys]
    .filter((polys) => polys.length > 0)
    .map((polys) => ({
      ...feature,
      geometry: {
        type: "MultiPolygon" as const,
        coordinates: polys.map((ring) => [ring]),
      },
    }));
}

function buildTimezoneLines(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  for (let offset = -12; offset <= 12; offset++) {
    const lng = offset * 15;
    const coords: [number, number][] = [];
    for (let lat = -85; lat <= 85; lat += 2) {
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

function buildOpacityExpr(
  hoveredColor: string | null
): maplibregl.ExpressionSpecification {
  if (!hoveredColor) {
    return [
      "case",
      ["!=", ["get", "tz_color"], ""],
      0.35,
      0,
    ] as unknown as maplibregl.ExpressionSpecification;
  }

  return [
    "case",
    ["==", ["get", "tz_color"], hoveredColor],
    0.6,
    ["!=", ["get", "tz_color"], ""],
    0.2,
    0,
  ] as unknown as maplibregl.ExpressionSpecification;
}

export function CountryTimezoneLayer({ onTzHover, onCountryClick, highlightColor, onMapInteract }: Props) {
  const { map, isLoaded } = useMap();
  const addedRef = useRef(false);
  const hoveredColorRef = useRef<string | null>(null);
  const hoveredCountryIdRef = useRef<number | null>(null);
  const externalColorRef = useRef<string | null>(null);
  const onTzHoverRef = useRef(onTzHover);
  const onCountryClickRef = useRef(onCountryClick);
  const onMapInteractRef = useRef(onMapInteract);

  useEffect(() => {
    onTzHoverRef.current = onTzHover;
    onCountryClickRef.current = onCountryClick;
    onMapInteractRef.current = onMapInteract;
  });

  const clearCountryHighlight = useCallback(() => {
    if (hoveredCountryIdRef.current !== null && map) {
      map.setFeatureState(
        { source: COUNTRY_SOURCE, id: hoveredCountryIdRef.current },
        { hover: false }
      );
      hoveredCountryIdRef.current = null;
    }
  }, [map]);

  useEffect(() => {
    if (!map || !isLoaded || addedRef.current) return;

    async function addLayer() {
      if (!map) return;

      try {
        const [tzRes, countryRes] = await Promise.all([
          fetch("/timezones.json"),
          fetch("/world-110m.json"),
        ]);

        const tzTopo: Topology = await tzRes.json();
        const countryTopo: Topology = await countryRes.json();

        // Convert timezone boundaries to GeoJSON and tag with tz_color + utcOffset
        const tzObjKey = Object.keys(tzTopo.objects)[0];
        const tzGeojson = topojson.feature(
          tzTopo,
          tzTopo.objects[tzObjKey]
        ) as GeoJSON.FeatureCollection;

        for (const feature of tzGeojson.features) {
          const tzid = (feature.properties?.tzid as string) ?? "";
          const utcKey = getUtcOffsetKey(tzid);
          feature.properties = {
            ...feature.properties,
            tz_color: (utcKey && timezoneColors[utcKey]) || "",
            utc_offset: utcKey,
          };
        }

        // Country features with numeric IDs for feature-state
        const rawCountryGeojson = topojson.feature(
          countryTopo,
          countryTopo.objects.countries as Parameters<typeof topojson.feature>[1]
        ) as GeoJSON.FeatureCollection;

        // Split anti-meridian crossers, assign numeric IDs
        const countryFeatures: GeoJSON.Feature[] = [];
        let syntheticId = 100000;
        for (const feature of rawCountryGeojson.features) {
          const numId = Number(feature.id) || 0;
          if (numId === 10) continue; // Skip Antarctica
          if (ANTIMERIDIAN_IDS.has(numId)) {
            const parts = splitAntimeridianFeature(feature);
            for (const part of parts) {
              part.id = syntheticId++;
              part.properties = { ...feature.properties };
              countryFeatures.push(part);
            }
          } else {
            feature.id = numId;
            countryFeatures.push(feature);
          }
        }
        const countryGeojson: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: countryFeatures,
        };

        const firstSymbolLayer = map
          .getStyle()
          ?.layers?.find((l) => l.type === "symbol");

        // 1. Timezone fill layer
        map.addSource(TZ_SOURCE, {
          type: "geojson",
          data: tzGeojson,
        });

        map.addLayer(
          {
            id: TZ_FILL_LAYER,
            type: "fill",
            source: TZ_SOURCE,
            paint: {
              "fill-color": [
                "case",
                ["!=", ["get", "tz_color"], ""],
                ["get", "tz_color"],
                "rgba(0,0,0,0)",
              ] as unknown as maplibregl.ExpressionSpecification,
              "fill-opacity": buildOpacityExpr(null),
            },
          },
          firstSymbolLayer?.id
        );

        // 2. Timezone boundary borders (subtle)
        map.addLayer(
          {
            id: TZ_BORDER_LAYER,
            type: "line",
            source: TZ_SOURCE,
            paint: {
              "line-color": "rgba(180, 180, 200, 0.2)",
              "line-width": 0.5,
            },
          },
          firstSymbolLayer?.id
        );

        // 3. Country features (invisible fill for hover/click detection)
        map.addSource(COUNTRY_SOURCE, {
          type: "geojson",
          data: countryGeojson,
        });

        map.addLayer(
          {
            id: COUNTRY_FILL_LAYER,
            type: "fill",
            source: COUNTRY_SOURCE,
            paint: {
              "fill-color": "rgba(0,0,0,0)",
              "fill-opacity": 0,
            },
          },
          firstSymbolLayer?.id
        );

        // 4. Country borders (base, thin)
        map.addLayer(
          {
            id: COUNTRY_BORDER_LAYER,
            type: "line",
            source: COUNTRY_SOURCE,
            paint: {
              "line-color": "rgba(200, 200, 220, 0.25)",
              "line-width": 0.8,
            },
          },
          firstSymbolLayer?.id
        );

        // 5. Country highlight border (feature-state driven)
        map.addLayer(
          {
            id: COUNTRY_HIGHLIGHT_LAYER,
            type: "line",
            source: COUNTRY_SOURCE,
            paint: {
              "line-color": "rgba(255, 255, 255, 0.7)",
              "line-width": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                2,
                0,
              ] as unknown as maplibregl.ExpressionSpecification,
            },
          },
          firstSymbolLayer?.id
        );

        // 6. Dashed meridian lines
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

        // --- Event handlers ---

        const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
          // Signal that the user is interacting with the map
          onMapInteractRef.current?.();

          // Timezone hover
          const tzFeatures = map.queryRenderedFeatures(e.point, {
            layers: [TZ_FILL_LAYER],
          });

          if (tzFeatures.length > 0) {
            const tzColor = tzFeatures[0].properties?.tz_color as string;
            const utcOffset = tzFeatures[0].properties?.utc_offset as string;
            const tzid = tzFeatures[0].properties?.tzid as string;

            if (tzColor && tzColor !== hoveredColorRef.current) {
              hoveredColorRef.current = tzColor;
              map.setPaintProperty(
                TZ_FILL_LAYER,
                "fill-opacity",
                buildOpacityExpr(tzColor)
              );
            }

            if (tzColor) {
              onTzHoverRef.current?.({
                tzColor,
                utcOffset: utcOffset || "",
                tzid: tzid || "",
                point: { x: e.point.x, y: e.point.y },
              });
            }
          }

          // Country hover (border highlight)
          const countryFeatures = map.queryRenderedFeatures(e.point, {
            layers: [COUNTRY_FILL_LAYER],
          });

          if (countryFeatures.length > 0) {
            const featureId = countryFeatures[0].id as number;
            if (featureId !== hoveredCountryIdRef.current) {
              clearCountryHighlight();
              hoveredCountryIdRef.current = featureId;
              map.setFeatureState(
                { source: COUNTRY_SOURCE, id: featureId },
                { hover: true }
              );
            }
            map.getCanvas().style.cursor = "pointer";
          } else {
            clearCountryHighlight();
          }
        };

        const handleMouseLeave = () => {
          hoveredColorRef.current = null;
          // Restore external highlight if set, otherwise clear
          map.setPaintProperty(
            TZ_FILL_LAYER,
            "fill-opacity",
            buildOpacityExpr(externalColorRef.current)
          );
          clearCountryHighlight();
          map.getCanvas().style.cursor = "";
          onTzHoverRef.current?.(null);
        };

        const handleClick = (e: maplibregl.MapMouseEvent) => {
          const countryFeatures = map.queryRenderedFeatures(e.point, {
            layers: [COUNTRY_FILL_LAYER],
          });

          if (countryFeatures.length > 0) {
            const name = countryFeatures[0].properties?.name as string;
            if (name) {
              // Also query timezone info at click point
              const tzFeatures = map.queryRenderedFeatures(e.point, {
                layers: [TZ_FILL_LAYER],
              });
              const tzid = (tzFeatures[0]?.properties?.tzid as string) || "";
              const utcOffset = (tzFeatures[0]?.properties?.utc_offset as string) || "";
              const tzColor = (tzFeatures[0]?.properties?.tz_color as string) || "";

              onCountryClickRef.current?.({
                name,
                point: { x: e.point.x, y: e.point.y },
                lngLat: { lng: e.lngLat.lng, lat: e.lngLat.lat },
                tzid,
                utcOffset,
                tzColor,
              });
            }
          }
        };

        map.on("mousemove", handleMouseMove);
        map.on("mouseleave", TZ_FILL_LAYER, handleMouseLeave);
        map.on("click", handleClick);

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
        if (map.getLayer(COUNTRY_HIGHLIGHT_LAYER))
          map.removeLayer(COUNTRY_HIGHLIGHT_LAYER);
        if (map.getLayer(COUNTRY_BORDER_LAYER))
          map.removeLayer(COUNTRY_BORDER_LAYER);
        if (map.getLayer(COUNTRY_FILL_LAYER))
          map.removeLayer(COUNTRY_FILL_LAYER);
        if (map.getSource(COUNTRY_SOURCE)) map.removeSource(COUNTRY_SOURCE);
        if (map.getLayer(TZ_BORDER_LAYER)) map.removeLayer(TZ_BORDER_LAYER);
        if (map.getLayer(TZ_FILL_LAYER)) map.removeLayer(TZ_FILL_LAYER);
        if (map.getSource(TZ_SOURCE)) map.removeSource(TZ_SOURCE);
        addedRef.current = false;
      } catch {
        // ignore cleanup errors
      }
    };
  }, [map, isLoaded, clearCountryHighlight]);

  // Apply external highlight color from label hover/click
  useEffect(() => {
    if (!map || !addedRef.current) return;
    if (!map.getLayer(TZ_FILL_LAYER)) return;

    externalColorRef.current = highlightColor ?? null;

    // Only apply if not currently hovering on map
    if (!hoveredColorRef.current) {
      map.setPaintProperty(
        TZ_FILL_LAYER,
        "fill-opacity",
        buildOpacityExpr(highlightColor ?? null)
      );
    }
  }, [map, highlightColor]);

  return null;
}
