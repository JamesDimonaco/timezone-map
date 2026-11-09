// Cities the visitor looked at recently, stored as slugs in localStorage so a
// returning visitor sees the time there without typing.

export const MAX_RECENT_CITIES = 5;

const STORAGE_KEY = "recent-cities";
// localStorage's "storage" event only fires in other tabs, so same-tab
// listeners (the chip row) need their own signal.
const CHANGE_EVENT = "recent-cities:change";

export function addRecentCity(slugs: string[], slug: string): string[] {
  return [slug, ...slugs.filter((s) => s !== slug)].slice(0, MAX_RECENT_CITIES);
}

export function parseRecentCities(raw: string | null): string[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const slugs = data.filter((s): s is string => typeof s === "string");
  return [...new Set(slugs)].slice(0, MAX_RECENT_CITIES);
}

export function readRecentCitiesRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function recordRecentCity(slug: string): void {
  try {
    const next = addRecentCity(parseRecentCities(readRecentCitiesRaw()), slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage blocked (private mode, quota) — recents are a nicety, skip them
  }
}

export function subscribeRecentCities(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
