"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { fuzzCoordinates, getOrCreateSessionId } from "@/lib/location";

export function usePresence(
  userLocation: { lat: number; lng: number } | null,
  userTimezone: string
) {
  const heartbeat = useMutation(api.presence.heartbeat);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userLocation) return;

    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    const { fuzzedLat, fuzzedLng } = fuzzCoordinates(
      userLocation.lat,
      userLocation.lng
    );

    const sendHeartbeat = () => {
      heartbeat({ sessionId, fuzzedLat, fuzzedLng, timezone: userTimezone });
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Send heartbeat every 30s
    intervalRef.current = setInterval(sendHeartbeat, 30_000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userLocation, userTimezone, heartbeat]);
}
