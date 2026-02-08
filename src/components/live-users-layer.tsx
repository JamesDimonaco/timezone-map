"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MapClusterLayer } from "@/components/ui/map";

export function LiveUsersLayer() {
  const data = useQuery(api.presence.getActiveUsers);

  const geojson = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(() => {
    if (!data?.users.length) {
      return { type: "FeatureCollection", features: [] };
    }

    return {
      type: "FeatureCollection",
      features: data.users.map((u, i) => ({
        type: "Feature" as const,
        id: i,
        properties: { timezone: u.timezone },
        geometry: {
          type: "Point" as const,
          coordinates: [u.fuzzedLng, u.fuzzedLat],
        },
      })),
    };
  }, [data]);

  if (!data) return null;

  return (
    <MapClusterLayer
      data={geojson}
      clusterColors={["#22c55e", "#16a34a", "#15803d"]}
      clusterThresholds={[10, 50]}
      clusterRadius={40}
      pointColor="#22c55e"
    />
  );
}
