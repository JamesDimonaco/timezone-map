const TO_RAD = Math.PI / 180;
const TO_DEG = 180 / Math.PI;
const ZENITH_RAD = 90.833 * TO_RAD;

export type SolarTimes = {
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date;
  dayLengthMinutes: number;
  isPolarDay: boolean;
  isPolarNight: boolean;
};

function dayOfYearUtc(year: number, month: number, day: number): number {
  const start = Date.UTC(year, 0, 1);
  const target = Date.UTC(year, month - 1, day);
  return Math.round((target - start) / 86_400_000);
}

function fractionalYear(year: number, month: number, day: number): number {
  return ((2 * Math.PI) / 365) * dayOfYearUtc(year, month, day);
}

function equationOfTimeMinutes(gamma: number): number {
  return (
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma))
  );
}

function solarDeclinationRad(gamma: number): number {
  return (
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma)
  );
}

/**
 * Returns sunrise, sunset, solar noon, and day length for a given lat/lng
 * on a given local-civil date. Uses the NOAA solar position algorithm.
 *
 * Date is interpreted as the local civil date at (lat, lng) — i.e. the
 * year/month/day the user actually sees on a calendar there. Output Date
 * objects represent the corresponding UTC instants and should be formatted
 * with `Intl.DateTimeFormat({ timeZone })` for display.
 */
export function getSolarTimes(
  lat: number,
  lng: number,
  localDate: { year: number; month: number; day: number },
): SolarTimes {
  const { year, month, day } = localDate;
  const gamma = fractionalYear(year, month, day);
  const eqtime = equationOfTimeMinutes(gamma);
  const decl = solarDeclinationRad(gamma);
  const latRad = lat * TO_RAD;

  const midnightUtc = Date.UTC(year, month - 1, day);
  const solarNoonMinutes = 720 - 4 * lng - eqtime;
  const solarNoon = new Date(midnightUtc + solarNoonMinutes * 60_000);

  const cosH =
    Math.cos(ZENITH_RAD) / (Math.cos(latRad) * Math.cos(decl)) -
    Math.tan(latRad) * Math.tan(decl);

  if (cosH > 1) {
    return {
      sunrise: null,
      sunset: null,
      solarNoon,
      dayLengthMinutes: 0,
      isPolarDay: false,
      isPolarNight: true,
    };
  }
  if (cosH < -1) {
    return {
      sunrise: null,
      sunset: null,
      solarNoon,
      dayLengthMinutes: 24 * 60,
      isPolarDay: true,
      isPolarNight: false,
    };
  }

  const haDeg = Math.acos(cosH) * TO_DEG;
  const sunriseMinutes = 720 - 4 * (lng + haDeg) - eqtime;
  const sunsetMinutes = 720 - 4 * (lng - haDeg) - eqtime;

  return {
    sunrise: new Date(midnightUtc + sunriseMinutes * 60_000),
    sunset: new Date(midnightUtc + sunsetMinutes * 60_000),
    solarNoon,
    dayLengthMinutes: sunsetMinutes - sunriseMinutes,
    isPolarDay: false,
    isPolarNight: false,
  };
}

export function formatDayLength(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function getLocalDate(
  timezone: string,
  now: Date = new Date(),
): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);
  return { year: get("year"), month: get("month"), day: get("day") };
}
