import { formatOffsetLabel, getOffsetMinutes } from "./dst";
import { cityToSlug, getCityBySlug } from "./slugs";
import { timezoneCities, type TimezoneCity } from "./timezones";

/** A row on the share-time page: a named city, or a bare UTC offset. */
export type Place =
  | { kind: "city"; city: TimezoneCity }
  | { kind: "utc"; offsetMinutes: number };

/** Shared row + everything else. Matches the Map compare panel. */
export const MAX_ROWS = 5;
const MAX_WITH = MAX_ROWS - 1;

const MINUTE = 60_000;
const DAY_MINUTES = 24 * 60;

const UTC_SLUG = /^utc(?:([+-])(\d{1,2})(?:[-:](\d{2}))?)?$/;

export function parsePlaceSlug(raw: string): Place | null {
  let slug: string;
  try {
    slug = decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    return null;
  }

  const utc = slug.match(UTC_SLUG);
  if (utc) {
    const hours = utc[2] ? parseInt(utc[2], 10) : 0;
    const minutes = utc[3] ? parseInt(utc[3], 10) : 0;
    if (![0, 15, 30, 45].includes(minutes)) return null;
    const offsetMinutes = (utc[1] === "-" ? -1 : 1) * (hours * 60 + minutes);
    // Real zones run from UTC-12 to UTC+14.
    if (offsetMinutes < -12 * 60 || offsetMinutes > 14 * 60) return null;
    return { kind: "utc", offsetMinutes };
  }

  const city = getCityBySlug(slug);
  return city ? { kind: "city", city } : null;
}

export function placeSlug(place: Place): string {
  if (place.kind === "city") return cityToSlug(place.city.name);
  const m = place.offsetMinutes;
  if (m === 0) return "utc";
  const abs = Math.abs(m);
  const mins = abs % 60;
  return `utc${m < 0 ? "-" : "+"}${Math.floor(abs / 60)}${mins ? `-${mins}` : ""}`;
}

export const formatUtcOffset = formatOffsetLabel;

export function placeLabel(place: Place): string {
  return place.kind === "city" ? place.city.name : formatUtcOffset(place.offsetMinutes);
}

export function offsetMinutesAt(place: Place, instant: number): number {
  return place.kind === "utc" ? place.offsetMinutes : getOffsetMinutes(place.city.timezone, new Date(instant));
}

/** Local minutes since the place's midnight, and a day number for ±1 day labels. */
export function wallClock(place: Place, instant: number): { minutesOfDay: number; day: number } {
  const localMinutes = Math.floor((instant + offsetMinutesAt(place, instant) * MINUTE) / MINUTE);
  const day = Math.floor(localMinutes / DAY_MINUTES);
  return { minutesOfDay: localMinutes - day * DAY_MINUTES, day };
}

/** The instant when `place` reads `minutesOfDay`, on the day it shows at `instant`. */
export function setWallTime(place: Place, instant: number, minutesOfDay: number): number {
  const { day } = wallClock(place, instant);
  const localMs = (day * DAY_MINUTES + minutesOfDay) * MINUTE;
  const guess = localMs - offsetMinutesAt(place, instant) * MINUTE;
  // The target time may sit on the other side of a DST change, so re-read the offset there.
  return localMs - offsetMinutesAt(place, guess) * MINUTE;
}

export function parseWithParam(value: string | null): Place[] {
  if (!value) return [];
  const seen = new Set<string>();
  const places: Place[] = [];
  for (const part of value.split(",")) {
    const place = parsePlaceSlug(part);
    if (!place) continue;
    const slug = placeSlug(place);
    if (seen.has(slug)) continue;
    seen.add(slug);
    places.push(place);
    if (places.length === MAX_WITH) break;
  }
  return places;
}

// Chrome still reports these pre-rename names; our city list uses the current ones.
const LEGACY_ZONES: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Europe/Kiev": "Europe/Kyiv",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Rangoon": "Asia/Yangon",
};

/** The viewer's place: their exact city if we list it, else their current UTC offset. */
export function placeForTimezone(timezone: string, instant: number): Place {
  const zone = LEGACY_ZONES[timezone] ?? timezone;
  const city = timezoneCities.find((c) => c.timezone === zone);
  if (city) return { kind: "city", city };
  // getOffsetMinutes returns 0 for a zone Intl doesn't know, so that lands on UTC.
  return { kind: "utc", offsetMinutes: getOffsetMinutes(timezone, new Date(instant)) };
}

export type Row = { place: Place; role: "shared" | "viewer" | "added" };

/** Shared place, then the viewer, then added places: no repeats, at most MAX_ROWS. */
export function buildRows(shared: Place, viewer: Place | null, added: Place[]): Row[] {
  const rows: Row[] = [];
  const seen = new Set<string>();
  const push = (place: Place, role: Row["role"]) => {
    const slug = placeSlug(place);
    if (seen.has(slug) || rows.length === MAX_ROWS) return;
    seen.add(slug);
    rows.push({ place, role });
  };
  push(shared, "shared");
  if (viewer) push(viewer, "viewer");
  for (const place of added) push(place, "added");
  return rows;
}
