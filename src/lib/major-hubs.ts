import { timezoneCities, type TimezoneCity } from "./timezones";
import { getOffsetMinutes } from "./dst";

const MAJOR_HUB_NAMES = [
  "New York",
  "London",
  "Tokyo",
  "Sydney",
  "Los Angeles",
  "Dubai",
  "Singapore",
  "Berlin",
] as const;

export function getMajorHubs(): TimezoneCity[] {
  return MAJOR_HUB_NAMES.map((name) =>
    timezoneCities.find((c) => c.name === name),
  ).filter((c): c is TimezoneCity => Boolean(c));
}

export type HubComparison = {
  hub: TimezoneCity;
  hourDifference: number;
  overlapHours: number;
  cityOverlapStart: number | null;
  cityOverlapEnd: number | null;
  hubOverlapStart: number | null;
  hubOverlapEnd: number | null;
};

const WORKDAY_START = 9;
const WORKDAY_END = 17;

export function compareCityToHubs(
  city: TimezoneCity,
  now: Date = new Date(),
): HubComparison[] {
  const cityOffsetH = getOffsetMinutes(city.timezone, now) / 60;
  return getMajorHubs()
    .filter((h) => h.timezone !== city.timezone)
    .map((hub) => {
      const hubOffsetH = getOffsetMinutes(hub.timezone, now) / 60;
      const hourDifference = cityOffsetH - hubOffsetH;

      const cityWorkUtcStart = WORKDAY_START - cityOffsetH;
      const cityWorkUtcEnd = WORKDAY_END - cityOffsetH;
      const hubWorkUtcStart = WORKDAY_START - hubOffsetH;
      const hubWorkUtcEnd = WORKDAY_END - hubOffsetH;

      const overlapUtcStart = Math.max(cityWorkUtcStart, hubWorkUtcStart);
      const overlapUtcEnd = Math.min(cityWorkUtcEnd, hubWorkUtcEnd);
      const overlapHours = Math.max(0, overlapUtcEnd - overlapUtcStart);

      if (overlapHours === 0) {
        return {
          hub,
          hourDifference,
          overlapHours: 0,
          cityOverlapStart: null,
          cityOverlapEnd: null,
          hubOverlapStart: null,
          hubOverlapEnd: null,
        };
      }

      return {
        hub,
        hourDifference,
        overlapHours,
        cityOverlapStart: overlapUtcStart + cityOffsetH,
        cityOverlapEnd: overlapUtcEnd + cityOffsetH,
        hubOverlapStart: overlapUtcStart + hubOffsetH,
        hubOverlapEnd: overlapUtcEnd + hubOffsetH,
      };
    })
    .sort((a, b) => Math.abs(a.hourDifference) - Math.abs(b.hourDifference));
}

export function formatLocalHour(hourFractional: number): string {
  const norm = ((hourFractional % 24) + 24) % 24;
  const h24 = Math.floor(norm);
  const minutes = Math.round((norm - h24) * 60);
  const period = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  if (minutes === 0) return `${h12}${period}`;
  return `${h12}:${minutes.toString().padStart(2, "0")}${period}`;
}

export function formatHourDifferenceLabel(diffHours: number): string {
  if (diffHours === 0) return "same time";
  const sign = diffHours > 0 ? "ahead" : "behind";
  const abs = Math.abs(diffHours);
  const whole = Math.floor(abs);
  const minutes = Math.round((abs - whole) * 60);
  if (minutes === 0) {
    return `${whole} hour${whole === 1 ? "" : "s"} ${sign}`;
  }
  return `${whole}h ${minutes}m ${sign}`;
}
