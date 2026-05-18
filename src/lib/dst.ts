export type DstTransition = {
  instant: Date;
  beforeOffsetMinutes: number;
  afterOffsetMinutes: number;
  type: "spring-forward" | "fall-back";
};

export type DstInfo = {
  observes: boolean;
  transitions: DstTransition[];
};

function parseShortOffsetToMinutes(s: string): number {
  if (s === "GMT" || s === "UTC") return 0;
  const m = s.match(/(?:GMT|UTC)([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (parseInt(m[2], 10) * 60 + (m[3] ? parseInt(m[3], 10) : 0));
}

export function getOffsetMinutes(timezone: string, date: Date): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
      hour: "numeric",
    }).formatToParts(date);
    const offsetStr =
      parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
    return parseShortOffsetToMinutes(offsetStr);
  } catch {
    return 0;
  }
}

function findTransitionInstant(
  timezone: string,
  beforeOffset: number,
  afterOffset: number,
  noonAfter: Date,
): Date {
  let lo = noonAfter.getTime() - 24 * 3_600_000;
  let hi = noonAfter.getTime();
  while (hi - lo > 60_000) {
    const mid = lo + Math.floor((hi - lo) / 2 / 60_000) * 60_000;
    if (getOffsetMinutes(timezone, new Date(mid)) === afterOffset) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return new Date(hi);
}

const cache = new Map<string, DstInfo>();

export function getDstInfo(timezone: string, year: number): DstInfo {
  const key = `${timezone}@${year}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const transitions: DstTransition[] = [];
  let prevOffset = getOffsetMinutes(
    timezone,
    new Date(Date.UTC(year, 0, 1, 12)),
  );

  for (let dayOfYear = 1; dayOfYear < 366; dayOfYear++) {
    const date = new Date(Date.UTC(year, 0, 1 + dayOfYear, 12));
    if (date.getUTCFullYear() !== year) break;
    const offset = getOffsetMinutes(timezone, date);
    if (offset !== prevOffset) {
      transitions.push({
        instant: findTransitionInstant(timezone, prevOffset, offset, date),
        beforeOffsetMinutes: prevOffset,
        afterOffsetMinutes: offset,
        type: offset > prevOffset ? "spring-forward" : "fall-back",
      });
      prevOffset = offset;
    }
  }

  const info: DstInfo = { observes: transitions.length > 0, transitions };
  cache.set(key, info);
  return info;
}

export function formatOffsetLabel(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${m.toString().padStart(2, "0")}`;
}
