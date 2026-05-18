import type { TimezoneCity } from "./timezones";
import { getOffsetMinutes, getDstInfo, type DstTransition } from "./dst";
import { haversineKm } from "./distance";

export type WorkdayOverlap = {
  hours: number;
  aStart: number | null;
  aEnd: number | null;
  bStart: number | null;
  bEnd: number | null;
};

export type PlannerRow = {
  aHour: number;
  bHour: number;
  aStatus: HourStatus;
  bStatus: HourStatus;
};

export type HourStatus = "sleep" | "early" | "work" | "evening" | "late";

export type OffsetSegment = {
  start: Date;
  end: Date;
  diffHours: number;
};

export type DstBehavior =
  | { kind: "both-fixed" }
  | { kind: "same-schedule"; aTransitions: DstTransition[] }
  | {
      kind: "one-observes";
      observerLabel: "A" | "B";
      transitions: DstTransition[];
      segments: OffsetSegment[];
      modalDiffHours: number;
    }
  | {
      kind: "different-schedules";
      aTransitions: DstTransition[];
      bTransitions: DstTransition[];
      segments: OffsetSegment[];
      modalDiffHours: number;
    };

export type CityPairAnalysis = {
  hourDifference: number;
  overlap: WorkdayOverlap;
  planner: PlannerRow[];
  dst: DstBehavior;
  distanceKm: number;
  flightHours: number;
};

const WORKDAY_START = 9;
const WORKDAY_END = 17;

function hourStatus(hour: number): HourStatus {
  const h = ((hour % 24) + 24) % 24;
  if (h < 6) return "sleep";
  if (h < 9) return "early";
  if (h < 17) return "work";
  if (h < 22) return "evening";
  return "late";
}

function computeOverlap(aOffsetH: number, bOffsetH: number): WorkdayOverlap {
  const aWorkUtcStart = WORKDAY_START - aOffsetH;
  const aWorkUtcEnd = WORKDAY_END - aOffsetH;
  const bWorkUtcStart = WORKDAY_START - bOffsetH;
  const bWorkUtcEnd = WORKDAY_END - bOffsetH;
  const overlapStartUtc = Math.max(aWorkUtcStart, bWorkUtcStart);
  const overlapEndUtc = Math.min(aWorkUtcEnd, bWorkUtcEnd);
  const hours = Math.max(0, overlapEndUtc - overlapStartUtc);
  if (hours === 0) {
    return { hours: 0, aStart: null, aEnd: null, bStart: null, bEnd: null };
  }
  return {
    hours,
    aStart: overlapStartUtc + aOffsetH,
    aEnd: overlapEndUtc + aOffsetH,
    bStart: overlapStartUtc + bOffsetH,
    bEnd: overlapEndUtc + bOffsetH,
  };
}

function buildPlanner(aOffsetH: number, bOffsetH: number): PlannerRow[] {
  const diff = bOffsetH - aOffsetH;
  const rows: PlannerRow[] = [];
  for (let h = 6; h <= 22; h++) {
    const aHour = h;
    const bHour = ((aHour + diff) % 24 + 24) % 24;
    rows.push({
      aHour,
      bHour,
      aStatus: hourStatus(aHour),
      bStatus: hourStatus(bHour),
    });
  }
  return rows;
}

function buildSegments(
  timezoneA: string,
  timezoneB: string,
  year: number,
): OffsetSegment[] {
  const aTransitions = getDstInfo(timezoneA, year).transitions;
  const bTransitions = getDstInfo(timezoneB, year).transitions;
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59));
  const boundaries: Date[] = [
    yearStart,
    ...aTransitions.map((t) => t.instant),
    ...bTransitions.map((t) => t.instant),
    yearEnd,
  ].sort((a, b) => a.getTime() - b.getTime());

  const raw: OffsetSegment[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    if (end.getTime() <= start.getTime()) continue;
    const mid = new Date((start.getTime() + end.getTime()) / 2);
    const diffHours =
      (getOffsetMinutes(timezoneA, mid) - getOffsetMinutes(timezoneB, mid)) /
      60;
    raw.push({ start, end, diffHours });
  }

  const merged: OffsetSegment[] = [];
  for (const seg of raw) {
    const last = merged[merged.length - 1];
    if (last && last.diffHours === seg.diffHours) {
      last.end = seg.end;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

function pickModalDiff(segments: OffsetSegment[]): number {
  if (segments.length === 0) return 0;
  const durations = new Map<number, number>();
  for (const s of segments) {
    const d = s.end.getTime() - s.start.getTime();
    durations.set(s.diffHours, (durations.get(s.diffHours) ?? 0) + d);
  }
  let bestDiff = segments[0].diffHours;
  let bestDur = -1;
  for (const [diff, dur] of durations) {
    if (dur > bestDur) {
      bestDiff = diff;
      bestDur = dur;
    }
  }
  return bestDiff;
}

function classifyDst(
  cityA: TimezoneCity,
  cityB: TimezoneCity,
  year: number,
): DstBehavior {
  const aInfo = getDstInfo(cityA.timezone, year);
  const bInfo = getDstInfo(cityB.timezone, year);
  const aObserves = aInfo.observes;
  const bObserves = bInfo.observes;

  if (!aObserves && !bObserves) {
    return { kind: "both-fixed" };
  }

  if (aObserves && bObserves) {
    const sameSchedule =
      aInfo.transitions.length === bInfo.transitions.length &&
      aInfo.transitions.every((t, i) => {
        const u = bInfo.transitions[i];
        return (
          Math.abs(t.instant.getTime() - u.instant.getTime()) < 86_400_000 &&
          t.type === u.type
        );
      });
    if (sameSchedule) {
      return { kind: "same-schedule", aTransitions: aInfo.transitions };
    }
    const segments = buildSegments(cityA.timezone, cityB.timezone, year);
    return {
      kind: "different-schedules",
      aTransitions: aInfo.transitions,
      bTransitions: bInfo.transitions,
      segments,
      modalDiffHours: pickModalDiff(segments),
    };
  }

  const segments = buildSegments(cityA.timezone, cityB.timezone, year);
  return {
    kind: "one-observes",
    observerLabel: aObserves ? "A" : "B",
    transitions: aObserves ? aInfo.transitions : bInfo.transitions,
    segments,
    modalDiffHours: pickModalDiff(segments),
  };
}

function estimateFlightHours(distanceKm: number): number {
  if (distanceKm < 200) return 0;
  return distanceKm / 850 + 1;
}

export function analyzeCityPair(
  cityA: TimezoneCity,
  cityB: TimezoneCity,
  now: Date = new Date(),
): CityPairAnalysis {
  const aOffsetH = getOffsetMinutes(cityA.timezone, now) / 60;
  const bOffsetH = getOffsetMinutes(cityB.timezone, now) / 60;
  const hourDifference = aOffsetH - bOffsetH;
  const overlap = computeOverlap(aOffsetH, bOffsetH);
  const planner = buildPlanner(aOffsetH, bOffsetH);
  const year = now.getUTCFullYear();
  const dst = classifyDst(cityA, cityB, year);
  const distanceKm = haversineKm(cityA.lat, cityA.lng, cityB.lat, cityB.lng);
  const flightHours = estimateFlightHours(distanceKm);

  return {
    hourDifference,
    overlap,
    planner,
    dst,
    distanceKm,
    flightHours,
  };
}
