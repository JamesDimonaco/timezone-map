export type TimezoneCity = {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string; // IANA timezone identifier
  utcOffset: string; // Display label like "UTC+5:30"
};

// Representative cities for each major UTC offset
export const timezoneCities: TimezoneCity[] = [
  // UTC-12
  { name: "Baker Island", country: "US", lat: 0.1936, lng: -176.4769, timezone: "Etc/GMT+12", utcOffset: "UTC-12" },

  // UTC-11
  { name: "Pago Pago", country: "American Samoa", lat: -14.2756, lng: -170.7020, timezone: "Pacific/Pago_Pago", utcOffset: "UTC-11" },

  // UTC-10
  { name: "Honolulu", country: "US", lat: 21.3069, lng: -157.8583, timezone: "Pacific/Honolulu", utcOffset: "UTC-10" },

  // UTC-9
  { name: "Anchorage", country: "US", lat: 61.2181, lng: -149.9003, timezone: "America/Anchorage", utcOffset: "UTC-9" },

  // UTC-8
  { name: "Los Angeles", country: "US", lat: 34.0522, lng: -118.2437, timezone: "America/Los_Angeles", utcOffset: "UTC-8" },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207, timezone: "America/Vancouver", utcOffset: "UTC-8" },

  // UTC-7
  { name: "Denver", country: "US", lat: 39.7392, lng: -104.9903, timezone: "America/Denver", utcOffset: "UTC-7" },
  { name: "Phoenix", country: "US", lat: 33.4484, lng: -112.0740, timezone: "America/Phoenix", utcOffset: "UTC-7" },

  // UTC-6
  { name: "Chicago", country: "US", lat: 41.8781, lng: -87.6298, timezone: "America/Chicago", utcOffset: "UTC-6" },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332, timezone: "America/Mexico_City", utcOffset: "UTC-6" },

  // UTC-5
  { name: "New York", country: "US", lat: 40.7128, lng: -74.0060, timezone: "America/New_York", utcOffset: "UTC-5" },
  { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, timezone: "America/Toronto", utcOffset: "UTC-5" },
  { name: "Bogota", country: "Colombia", lat: 4.7110, lng: -74.0721, timezone: "America/Bogota", utcOffset: "UTC-5" },

  // UTC-4
  { name: "Santiago", country: "Chile", lat: -33.4489, lng: -70.6693, timezone: "America/Santiago", utcOffset: "UTC-4" },
  { name: "Halifax", country: "Canada", lat: 44.6488, lng: -63.5752, timezone: "America/Halifax", utcOffset: "UTC-4" },
  { name: "Caracas", country: "Venezuela", lat: 10.4806, lng: -66.9036, timezone: "America/Caracas", utcOffset: "UTC-4" },

  // UTC-3
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333, timezone: "America/Sao_Paulo", utcOffset: "UTC-3" },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816, timezone: "America/Argentina/Buenos_Aires", utcOffset: "UTC-3" },

  // UTC-2
  { name: "South Georgia", country: "UK", lat: -54.2500, lng: -36.7500, timezone: "Atlantic/South_Georgia", utcOffset: "UTC-2" },

  // UTC-1
  { name: "Azores", country: "Portugal", lat: 38.7167, lng: -27.2167, timezone: "Atlantic/Azores", utcOffset: "UTC-1" },

  // UTC+0
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278, timezone: "Europe/London", utcOffset: "UTC+0" },
  { name: "Reykjavik", country: "Iceland", lat: 64.1466, lng: -21.9426, timezone: "Atlantic/Reykjavik", utcOffset: "UTC+0" },
  { name: "Accra", country: "Ghana", lat: 5.6037, lng: -0.1870, timezone: "Africa/Accra", utcOffset: "UTC+0" },

  // UTC+1
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, timezone: "Europe/Paris", utcOffset: "UTC+1" },
  { name: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050, timezone: "Europe/Berlin", utcOffset: "UTC+1" },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792, timezone: "Africa/Lagos", utcOffset: "UTC+1" },

  // UTC+2
  { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, timezone: "Africa/Cairo", utcOffset: "UTC+2" },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lng: 28.0473, timezone: "Africa/Johannesburg", utcOffset: "UTC+2" },
  { name: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275, timezone: "Europe/Athens", utcOffset: "UTC+2" },

  // UTC+3
  { name: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173, timezone: "Europe/Moscow", utcOffset: "UTC+3" },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784, timezone: "Europe/Istanbul", utcOffset: "UTC+3" },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219, timezone: "Africa/Nairobi", utcOffset: "UTC+3" },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753, timezone: "Asia/Riyadh", utcOffset: "UTC+3" },

  // UTC+3:30
  { name: "Tehran", country: "Iran", lat: 35.6892, lng: 51.3890, timezone: "Asia/Tehran", utcOffset: "UTC+3:30" },

  // UTC+4
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, timezone: "Asia/Dubai", utcOffset: "UTC+4" },

  // UTC+4:30
  { name: "Kabul", country: "Afghanistan", lat: 34.5553, lng: 69.2075, timezone: "Asia/Kabul", utcOffset: "UTC+4:30" },

  // UTC+5
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lng: 67.0011, timezone: "Asia/Karachi", utcOffset: "UTC+5" },
  { name: "Tashkent", country: "Uzbekistan", lat: 41.2995, lng: 69.2401, timezone: "Asia/Tashkent", utcOffset: "UTC+5" },

  // UTC+5:30
  { name: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777, timezone: "Asia/Kolkata", utcOffset: "UTC+5:30" },
  { name: "Delhi", country: "India", lat: 28.7041, lng: 77.1025, timezone: "Asia/Kolkata", utcOffset: "UTC+5:30" },

  // UTC+5:45
  { name: "Kathmandu", country: "Nepal", lat: 27.7172, lng: 85.3240, timezone: "Asia/Kathmandu", utcOffset: "UTC+5:45" },

  // UTC+6
  { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125, timezone: "Asia/Dhaka", utcOffset: "UTC+6" },

  // UTC+6:30
  { name: "Yangon", country: "Myanmar", lat: 16.8661, lng: 96.1951, timezone: "Asia/Yangon", utcOffset: "UTC+6:30" },

  // UTC+7
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, timezone: "Asia/Bangkok", utcOffset: "UTC+7" },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456, timezone: "Asia/Jakarta", utcOffset: "UTC+7" },
  { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lng: 106.6297, timezone: "Asia/Ho_Chi_Minh", utcOffset: "UTC+7" },

  // UTC+8
  { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074, timezone: "Asia/Shanghai", utcOffset: "UTC+8" },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, timezone: "Asia/Singapore", utcOffset: "UTC+8" },
  { name: "Perth", country: "Australia", lat: -31.9505, lng: 115.8605, timezone: "Australia/Perth", utcOffset: "UTC+8" },
  { name: "Hong Kong", country: "China", lat: 22.3193, lng: 114.1694, timezone: "Asia/Hong_Kong", utcOffset: "UTC+8" },

  // UTC+9
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, timezone: "Asia/Tokyo", utcOffset: "UTC+9" },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780, timezone: "Asia/Seoul", utcOffset: "UTC+9" },

  // UTC+9:30
  { name: "Adelaide", country: "Australia", lat: -34.9285, lng: 138.6007, timezone: "Australia/Adelaide", utcOffset: "UTC+9:30" },

  // UTC+10
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, timezone: "Australia/Sydney", utcOffset: "UTC+10" },
  { name: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631, timezone: "Australia/Melbourne", utcOffset: "UTC+10" },

  // UTC+11
  { name: "Noumea", country: "New Caledonia", lat: -22.2558, lng: 166.4505, timezone: "Pacific/Noumea", utcOffset: "UTC+11" },

  // UTC+12
  { name: "Auckland", country: "New Zealand", lat: -36.8485, lng: 174.7633, timezone: "Pacific/Auckland", utcOffset: "UTC+12" },
  { name: "Fiji", country: "Fiji", lat: -17.7134, lng: 178.0650, timezone: "Pacific/Fiji", utcOffset: "UTC+12" },

  // UTC+13
  { name: "Apia", country: "Samoa", lat: -13.8333, lng: -171.7500, timezone: "Pacific/Apia", utcOffset: "UTC+13" },
];

// Color palette for timezone bands - warm to cool gradient across the globe
export const timezoneColors: Record<string, string> = {
  "UTC-12": "#6366f1",
  "UTC-11": "#818cf8",
  "UTC-10": "#8b5cf6",
  "UTC-9": "#a78bfa",
  "UTC-8": "#c084fc",
  "UTC-7": "#e879f9",
  "UTC-6": "#f472b6",
  "UTC-5": "#fb7185",
  "UTC-4": "#f87171",
  "UTC-3": "#fb923c",
  "UTC-2": "#fbbf24",
  "UTC-1": "#facc15",
  "UTC+0": "#a3e635",
  "UTC+1": "#4ade80",
  "UTC+2": "#34d399",
  "UTC+3": "#2dd4bf",
  "UTC+3:30": "#22d3ee",
  "UTC+4": "#38bdf8",
  "UTC+4:30": "#60a5fa",
  "UTC+5": "#818cf8",
  "UTC+5:30": "#a78bfa",
  "UTC+5:45": "#c084fc",
  "UTC+6": "#c084fc",
  "UTC+6:30": "#d946ef",
  "UTC+7": "#e879f9",
  "UTC+8": "#f472b6",
  "UTC+9": "#fb7185",
  "UTC+9:30": "#f87171",
  "UTC+10": "#fb923c",
  "UTC+11": "#fbbf24",
  "UTC+12": "#facc15",
  "UTC+13": "#a3e635",
};

export function formatTimeInTimezone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
  } catch {
    return "--:--";
  }
}

export function formatDateInTimezone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date());
  } catch {
    return "";
  }
}

// Generate timezone boundary lines (approximate vertical lines)
export function getTimezoneBoundaryLines(): [number, number][][] {
  const lines: [number, number][][] = [];
  for (let offset = -12; offset <= 12; offset++) {
    const lng = offset * 15;
    const line: [number, number][] = [];
    for (let lat = -85; lat <= 85; lat += 5) {
      line.push([lng, lat]);
    }
    lines.push(line);
  }
  return lines;
}

// Zone label data: one label per whole-hour UTC offset, placed at bottom of each zone
export type TimezoneZoneLabel = {
  utcOffset: string;
  lng: number; // center longitude of the zone
  timezone: string; // IANA timezone for formatting time
};

export const timezoneZoneLabels: TimezoneZoneLabel[] = Array.from(
  { length: 25 },
  (_, i) => {
    const offset = i - 12;
    const key =
      offset === 0 ? "UTC+0" : offset > 0 ? `UTC+${offset}` : `UTC${offset}`;
    const lng = offset * 15; // center of this zone

    // Find a representative city for this offset to get the IANA timezone
    const city = timezoneCities.find((c) => c.utcOffset === key);
    const timezone = city?.timezone ?? `Etc/GMT${offset <= 0 ? "+" : "-"}${Math.abs(offset)}`;

    return { utcOffset: key, lng, timezone };
  }
);
