import type { TimezoneCity } from "@/lib/timezones";
import {
  formatDayLength,
  getLocalDate,
  getSolarTimes,
} from "@/lib/astronomy";

function formatLocalTime(timezone: string, date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatLocalLongDate(timezone: string, date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="font-mono text-sm font-medium">{value}</div>
    </div>
  );
}

export function CityTodayBlock({ city }: { city: TimezoneCity }) {
  const localDate = getLocalDate(city.timezone);
  const solar = getSolarTimes(city.lat, city.lng, localDate);
  const referenceUtc = new Date(
    Date.UTC(localDate.year, localDate.month - 1, localDate.day, 12),
  );
  const todayLabel = formatLocalLongDate(city.timezone, referenceUtc);

  const sunriseLabel = solar.sunrise
    ? formatLocalTime(city.timezone, solar.sunrise)
    : null;
  const sunsetLabel = solar.sunset
    ? formatLocalTime(city.timezone, solar.sunset)
    : null;
  const noonLabel = formatLocalTime(city.timezone, solar.solarNoon);

  let narrative: string;
  if (solar.isPolarNight) {
    narrative = `On ${todayLabel}, ${city.name} is in polar night — the sun does not rise above the horizon. Solar noon (the sun's highest point of the day) is at ${noonLabel} local time.`;
  } else if (solar.isPolarDay) {
    narrative = `On ${todayLabel}, ${city.name} is in polar day — the sun does not set. Solar noon is at ${noonLabel} local time, with 24 hours of daylight.`;
  } else {
    narrative = `On ${todayLabel}, ${city.name} sees ${formatDayLength(solar.dayLengthMinutes)} of daylight. The sun rises at ${sunriseLabel}, reaches its highest point at ${noonLabel}, and sets at ${sunsetLabel} local time.`;
  }

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">
        Today in {city.name}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Stat label="Sunrise" value={sunriseLabel ?? "—"} />
        <Stat label="Solar noon" value={noonLabel} />
        <Stat label="Sunset" value={sunsetLabel ?? "—"} />
        <Stat
          label="Day length"
          value={
            solar.isPolarDay
              ? "24h 00m"
              : solar.isPolarNight
                ? "0h 00m"
                : formatDayLength(solar.dayLengthMinutes)
          }
        />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {narrative}
      </p>
    </section>
  );
}
