/** Round coordinates to nearest 0.5° (~50km) for privacy */
export function fuzzCoordinates(lat: number, lng: number) {
  return {
    fuzzedLat: Math.round(lat * 2) / 2,
    fuzzedLng: Math.round(lng * 2) / 2,
  };
}

/** Get or create a session ID stored in sessionStorage (cleared on browser close) */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "tz-presence-session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}
