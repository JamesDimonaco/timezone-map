import { describe, expect, it } from "vitest";
import {
  MAX_ROWS,
  buildRows,
  formatUtcOffset,
  offsetMinutesAt,
  parsePlaceSlug,
  parseWithParam,
  placeForTimezone,
  placeLabel,
  placeSlug,
  setWallTime,
  wallClock,
  type Place,
} from "./share-time";

const at = (iso: string) => new Date(iso).getTime();

function city(slug: string): Place {
  const place = parsePlaceSlug(slug);
  if (!place) throw new Error(`no place for ${slug}`);
  return place;
}

describe("parsePlaceSlug", () => {
  it("finds a city by its slug", () => {
    expect(placeLabel(city("london"))).toBe("London");
  });

  it("reads whole and half-hour UTC offsets", () => {
    expect(parsePlaceSlug("utc+5-30")).toMatchObject({ kind: "utc", offsetMinutes: 330 });
    expect(parsePlaceSlug("utc-3-30")).toMatchObject({ kind: "utc", offsetMinutes: -210 });
    expect(parsePlaceSlug("utc+5:45")).toMatchObject({ kind: "utc", offsetMinutes: 345 });
    expect(parsePlaceSlug("utc-7")).toMatchObject({ kind: "utc", offsetMinutes: -420 });
  });

  it("treats bare utc and utc+0 as UTC", () => {
    expect(parsePlaceSlug("utc")).toMatchObject({ kind: "utc", offsetMinutes: 0 });
    expect(parsePlaceSlug("utc+0")).toMatchObject({ kind: "utc", offsetMinutes: 0 });
  });

  it("decodes a percent-encoded plus sign", () => {
    expect(parsePlaceSlug("utc%2B9")).toMatchObject({ kind: "utc", offsetMinutes: 540 });
  });

  it("rejects offsets no real zone uses", () => {
    expect(parsePlaceSlug("utc+15")).toBeNull();
    expect(parsePlaceSlug("utc-13")).toBeNull();
    expect(parsePlaceSlug("utc+5-20")).toBeNull();
  });

  it("rejects unknown places", () => {
    expect(parsePlaceSlug("narnia")).toBeNull();
  });
});

describe("placeSlug", () => {
  it("writes the canonical UTC slug", () => {
    expect(placeSlug({ kind: "utc", offsetMinutes: 330 })).toBe("utc+5-30");
    expect(placeSlug({ kind: "utc", offsetMinutes: -210 })).toBe("utc-3-30");
    expect(placeSlug({ kind: "utc", offsetMinutes: 0 })).toBe("utc");
  });

  it("round-trips a city", () => {
    expect(placeSlug(city("sao-paulo"))).toBe("sao-paulo");
  });
});

describe("formatUtcOffset", () => {
  it("formats signs and half hours", () => {
    expect(formatUtcOffset(0)).toBe("UTC+0");
    expect(formatUtcOffset(330)).toBe("UTC+5:30");
    expect(formatUtcOffset(-210)).toBe("UTC-3:30");
    expect(formatUtcOffset(-480)).toBe("UTC-8");
  });
});

describe("offsetMinutesAt", () => {
  it("follows DST for a city", () => {
    expect(offsetMinutesAt(city("london"), at("2026-01-15T12:00:00Z"))).toBe(0);
    expect(offsetMinutesAt(city("london"), at("2026-07-15T12:00:00Z"))).toBe(60);
  });

  it("handles a 45-minute zone", () => {
    expect(offsetMinutesAt(city("kathmandu"), at("2026-01-15T12:00:00Z"))).toBe(345);
  });

  it("is fixed for a UTC place", () => {
    const place = city("utc+5-30");
    expect(offsetMinutesAt(place, at("2026-07-15T12:00:00Z"))).toBe(330);
  });
});

describe("wallClock", () => {
  it("shows Tokyo a day ahead of London late in the evening", () => {
    const instant = at("2026-01-15T23:30:00Z");
    const london = wallClock(city("london"), instant);
    const tokyo = wallClock(city("tokyo"), instant);
    expect(london.minutesOfDay).toBe(23 * 60 + 30);
    expect(tokyo.minutesOfDay).toBe(8 * 60 + 30);
    expect(tokyo.day - london.day).toBe(1);
  });
});

describe("setWallTime", () => {
  it("moves within the place's current day", () => {
    const base = at("2026-01-15T12:00:00Z");
    expect(setWallTime(city("london"), base, 18 * 60)).toBe(at("2026-01-15T18:00:00Z"));
    expect(setWallTime(city("london"), base, 0)).toBe(at("2026-01-15T00:00:00Z"));
  });

  it("uses the dragged place's own day, not UTC's", () => {
    // 20:00Z on the 15th is already the 16th in Tokyo.
    const base = at("2026-01-15T20:00:00Z");
    expect(setWallTime(city("tokyo"), base, 60)).toBe(at("2026-01-15T16:00:00Z"));
  });

  it("drags every other row along", () => {
    const base = at("2026-01-15T12:00:00Z");
    const instant = setWallTime(city("tokyo"), base, 8 * 60);
    const london = wallClock(city("london"), instant);
    expect(london.minutesOfDay).toBe(23 * 60);
    expect(wallClock(city("tokyo"), instant).day - london.day).toBe(1);
  });

  it("uses the summer offset on a DST change day", () => {
    // London springs forward at 01:00Z on 29 Mar 2026.
    const base = at("2026-03-29T00:30:00Z");
    expect(setWallTime(city("london"), base, 12 * 60)).toBe(at("2026-03-29T11:00:00Z"));
  });

  it("works for half-hour UTC places", () => {
    const base = at("2026-01-15T12:00:00Z");
    expect(setWallTime(city("utc+5-30"), base, 9 * 60)).toBe(at("2026-01-15T03:30:00Z"));
  });
});

describe("parseWithParam", () => {
  it("keeps valid places and drops unknown ones", () => {
    const places = parseWithParam("tokyo,utc+3,narnia");
    expect(places.map(placeSlug)).toEqual(["tokyo", "utc+3"]);
  });

  it("drops duplicates", () => {
    expect(parseWithParam("tokyo,tokyo").map(placeSlug)).toEqual(["tokyo"]);
  });

  it("leaves room for the shared row in a 5-row cap", () => {
    expect(MAX_ROWS).toBe(5);
    const places = parseWithParam("tokyo,paris,dubai,sydney,lima");
    expect(places.map(placeSlug)).toEqual(["tokyo", "paris", "dubai", "sydney"]);
  });

  it("handles a missing param", () => {
    expect(parseWithParam(null)).toEqual([]);
  });
});

describe("placeForTimezone", () => {
  it("uses a city when the zone matches one exactly", () => {
    expect(placeSlug(placeForTimezone("Europe/London", at("2026-01-15T12:00:00Z")))).toBe(
      "london",
    );
  });

  it("falls back to a UTC place when no city matches", () => {
    expect(placeSlug(placeForTimezone("Etc/GMT-7", at("2026-01-15T12:00:00Z")))).toBe("utc+7");
  });

  it("falls back to UTC for a zone Intl does not know", () => {
    expect(placeSlug(placeForTimezone("Not/AZone", at("2026-01-15T12:00:00Z")))).toBe("utc");
  });
});

describe("placeForTimezone with legacy zone names", () => {
  // Chrome still reports some pre-rename IANA names.
  it.each([
    ["Asia/Calcutta", "Asia/Kolkata"],
    ["Europe/Kiev", "Europe/Kyiv"],
    ["Asia/Saigon", "Asia/Ho_Chi_Minh"],
    ["America/Buenos_Aires", "America/Argentina/Buenos_Aires"],
    ["Asia/Katmandu", "Asia/Kathmandu"],
    ["Asia/Rangoon", "Asia/Yangon"],
  ])("maps %s to a %s city", (legacy, modern) => {
    const place = placeForTimezone(legacy, at("2026-01-15T12:00:00Z"));
    expect(place.kind === "city" && place.city.timezone).toBe(modern);
  });
});

describe("buildRows", () => {
  const slugs = (rows: { place: Place }[]) => rows.map((r) => placeSlug(r.place));

  it("puts shared first, then the viewer, then added places", () => {
    const rows = buildRows(city("tokyo"), city("london"), [city("paris")]);
    expect(slugs(rows)).toEqual(["tokyo", "london", "paris"]);
    expect(rows.map((r) => r.role)).toEqual(["shared", "viewer", "added"]);
  });

  it("never shows a place twice", () => {
    const rows = buildRows(city("tokyo"), city("tokyo"), [city("tokyo"), city("paris"), city("paris")]);
    expect(slugs(rows)).toEqual(["tokyo", "paris"]);
  });

  it("caps at MAX_ROWS, dropping the last added place before the viewer", () => {
    const added = ["london", "paris", "dubai", "sydney"].map(city);
    const rows = buildRows(city("tokyo"), city("new-york"), added);
    expect(slugs(rows)).toEqual(["tokyo", "new-york", "london", "paris", "dubai"]);
  });

  it("works before the viewer is known", () => {
    expect(slugs(buildRows(city("tokyo"), null, []))).toEqual(["tokyo"]);
  });
});
