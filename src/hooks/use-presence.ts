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
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    if (!userLocation) return;

    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;
    sessionIdRef.current = sessionId;

    const { fuzzedLat, fuzzedLng } = fuzzCoordinates(
      userLocation.lat,
      userLocation.lng
    );

    const sendHeartbeat = () => {
      heartbeat({ sessionId, fuzzedLat, fuzzedLng, timezone: userTimezone })
        .catch(() => {});
    };

    sendHeartbeat();
    intervalRef.current = setInterval(sendHeartbeat, 30_000);

    // Attempt cleanup on tab close / navigate away
    const handleUnload = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [userLocation, userTimezone, heartbeat]);
}
