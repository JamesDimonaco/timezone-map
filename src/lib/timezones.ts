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
  { name: "San Francisco", country: "US", lat: 37.7749, lng: -122.4194, timezone: "America/Los_Angeles", utcOffset: "UTC-8" },
  { name: "Seattle", country: "US", lat: 47.6062, lng: -122.3321, timezone: "America/Los_Angeles", utcOffset: "UTC-8" },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207, timezone: "America/Vancouver", utcOffset: "UTC-8" },
  { name: "Portland", country: "US", lat: 45.5152, lng: -122.6784, timezone: "America/Los_Angeles", utcOffset: "UTC-8" },

  // UTC-7
  { name: "Denver", country: "US", lat: 39.7392, lng: -104.9903, timezone: "America/Denver", utcOffset: "UTC-7" },
  { name: "Phoenix", country: "US", lat: 33.4484, lng: -112.0740, timezone: "America/Phoenix", utcOffset: "UTC-7" },
  { name: "Salt Lake City", country: "US", lat: 40.7608, lng: -111.8910, timezone: "America/Denver", utcOffset: "UTC-7" },
  { name: "Calgary", country: "Canada", lat: 51.0447, lng: -114.0719, timezone: "America/Edmonton", utcOffset: "UTC-7" },

  // UTC-6
  { name: "Chicago", country: "US", lat: 41.8781, lng: -87.6298, timezone: "America/Chicago", utcOffset: "UTC-6" },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332, timezone: "America/Mexico_City", utcOffset: "UTC-6" },
  { name: "Houston", country: "US", lat: 29.7604, lng: -95.3698, timezone: "America/Chicago", utcOffset: "UTC-6" },
  { name: "Dallas", country: "US", lat: 32.7767, lng: -96.7970, timezone: "America/Chicago", utcOffset: "UTC-6" },
  { name: "Austin", country: "US", lat: 30.2672, lng: -97.7431, timezone: "America/Chicago", utcOffset: "UTC-6" },
  { name: "Winnipeg", country: "Canada", lat: 49.8951, lng: -97.1384, timezone: "America/Winnipeg", utcOffset: "UTC-6" },
  { name: "Guatemala City", country: "Guatemala", lat: 14.6349, lng: -90.5069, timezone: "America/Guatemala", utcOffset: "UTC-6" },
  { name: "San José", country: "Costa Rica", lat: 9.9281, lng: -84.0907, timezone: "America/Costa_Rica", utcOffset: "UTC-6" },

  // UTC-5
  { name: "New York", country: "US", lat: 40.7128, lng: -74.0060, timezone: "America/New_York", utcOffset: "UTC-5" },
  { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, timezone: "America/Toronto", utcOffset: "UTC-5" },
  { name: "Miami", country: "US", lat: 25.7617, lng: -80.1918, timezone: "America/New_York", utcOffset: "UTC-5" },
  { name: "Washington DC", country: "US", lat: 38.9072, lng: -77.0369, timezone: "America/New_York", utcOffset: "UTC-5" },
  { name: "Boston", country: "US", lat: 42.3601, lng: -71.0589, timezone: "America/New_York", utcOffset: "UTC-5" },
  { name: "Atlanta", country: "US", lat: 33.7490, lng: -84.3880, timezone: "America/New_York", utcOffset: "UTC-5" },
  { name: "Montreal", country: "Canada", lat: 45.5017, lng: -73.5673, timezone: "America/Toronto", utcOffset: "UTC-5" },
  { name: "Bogota", country: "Colombia", lat: 4.7110, lng: -74.0721, timezone: "America/Bogota", utcOffset: "UTC-5" },
  { name: "Lima", country: "Peru", lat: -12.0464, lng: -77.0428, timezone: "America/Lima", utcOffset: "UTC-5" },
  { name: "Havana", country: "Cuba", lat: 23.1136, lng: -82.3666, timezone: "America/Havana", utcOffset: "UTC-5" },
  { name: "Panama City", country: "Panama", lat: 8.9824, lng: -79.5199, timezone: "America/Panama", utcOffset: "UTC-5" },

  // UTC-4
  { name: "Santiago", country: "Chile", lat: -33.4489, lng: -70.6693, timezone: "America/Santiago", utcOffset: "UTC-4" },
  { name: "Halifax", country: "Canada", lat: 44.6488, lng: -63.5752, timezone: "America/Halifax", utcOffset: "UTC-4" },
  { name: "Caracas", country: "Venezuela", lat: 10.4806, lng: -66.9036, timezone: "America/Caracas", utcOffset: "UTC-4" },
  { name: "Santo Domingo", country: "Dominican Republic", lat: 18.4861, lng: -69.9312, timezone: "America/Santo_Domingo", utcOffset: "UTC-4" },
  { name: "La Paz", country: "Bolivia", lat: -16.4897, lng: -68.1193, timezone: "America/La_Paz", utcOffset: "UTC-4" },

  // UTC-3:30
  { name: "St. John's", country: "Canada", lat: 47.5615, lng: -52.7126, timezone: "America/St_Johns", utcOffset: "UTC-3:30" },

  // UTC-3
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333, timezone: "America/Sao_Paulo", utcOffset: "UTC-3" },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lng: -58.3816, timezone: "America/Argentina/Buenos_Aires", utcOffset: "UTC-3" },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729, timezone: "America/Sao_Paulo", utcOffset: "UTC-3" },
  { name: "Montevideo", country: "Uruguay", lat: -34.9011, lng: -56.1645, timezone: "America/Montevideo", utcOffset: "UTC-3" },

  // UTC-2
  { name: "South Georgia", country: "UK", lat: -54.2500, lng: -36.7500, timezone: "Atlantic/South_Georgia", utcOffset: "UTC-2" },

  // UTC-1
  { name: "Azores", country: "Portugal", lat: 38.7167, lng: -27.2167, timezone: "Atlantic/Azores", utcOffset: "UTC-1" },
  { name: "Cape Verde", country: "Cape Verde", lat: 14.9331, lng: -23.5133, timezone: "Atlantic/Cape_Verde", utcOffset: "UTC-1" },

  // UTC+0
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278, timezone: "Europe/London", utcOffset: "UTC+0" },
  { name: "Dublin", country: "Ireland", lat: 53.3498, lng: -6.2603, timezone: "Europe/Dublin", utcOffset: "UTC+0" },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393, timezone: "Europe/Lisbon", utcOffset: "UTC+0" },
  { name: "Reykjavik", country: "Iceland", lat: 64.1466, lng: -21.9426, timezone: "Atlantic/Reykjavik", utcOffset: "UTC+0" },
  { name: "Accra", country: "Ghana", lat: 5.6037, lng: -0.1870, timezone: "Africa/Accra", utcOffset: "UTC+0" },
  { name: "Casablanca", country: "Morocco", lat: 33.5731, lng: -7.5898, timezone: "Africa/Casablanca", utcOffset: "UTC+0" },
  { name: "Edinburgh", country: "UK", lat: 55.9533, lng: -3.1883, timezone: "Europe/London", utcOffset: "UTC+0" },

  // UTC+1
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, timezone: "Europe/Paris", utcOffset: "UTC+1" },
  { name: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050, timezone: "Europe/Berlin", utcOffset: "UTC+1" },
  { name: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038, timezone: "Europe/Madrid", utcOffset: "UTC+1" },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, timezone: "Europe/Rome", utcOffset: "UTC+1" },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041, timezone: "Europe/Amsterdam", utcOffset: "UTC+1" },
  { name: "Brussels", country: "Belgium", lat: 50.8503, lng: 4.3517, timezone: "Europe/Brussels", utcOffset: "UTC+1" },
  { name: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738, timezone: "Europe/Vienna", utcOffset: "UTC+1" },
  { name: "Zurich", country: "Switzerland", lat: 47.3769, lng: 8.5417, timezone: "Europe/Zurich", utcOffset: "UTC+1" },
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686, timezone: "Europe/Stockholm", utcOffset: "UTC+1" },
  { name: "Oslo", country: "Norway", lat: 59.9139, lng: 10.7522, timezone: "Europe/Oslo", utcOffset: "UTC+1" },
  { name: "Copenhagen", country: "Denmark", lat: 55.6761, lng: 12.5683, timezone: "Europe/Copenhagen", utcOffset: "UTC+1" },
  { name: "Warsaw", country: "Poland", lat: 52.2297, lng: 21.0122, timezone: "Europe/Warsaw", utcOffset: "UTC+1" },
  { name: "Prague", country: "Czech Republic", lat: 50.0755, lng: 14.4378, timezone: "Europe/Prague", utcOffset: "UTC+1" },
  { name: "Munich", country: "Germany", lat: 48.1351, lng: 11.5820, timezone: "Europe/Berlin", utcOffset: "UTC+1" },
  { name: "Barcelona", country: "Spain", lat: 41.3874, lng: 2.1686, timezone: "Europe/Madrid", utcOffset: "UTC+1" },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792, timezone: "Africa/Lagos", utcOffset: "UTC+1" },
  { name: "Algiers", country: "Algeria", lat: 36.7538, lng: 3.0588, timezone: "Africa/Algiers", utcOffset: "UTC+1" },

  // UTC+2
  { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, timezone: "Africa/Cairo", utcOffset: "UTC+2" },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lng: 28.0473, timezone: "Africa/Johannesburg", utcOffset: "UTC+2" },
  { name: "Athens", country: "Greece", lat: 37.9838, lng: 23.7275, timezone: "Europe/Athens", utcOffset: "UTC+2" },
  { name: "Helsinki", country: "Finland", lat: 60.1699, lng: 24.9384, timezone: "Europe/Helsinki", utcOffset: "UTC+2" },
  { name: "Bucharest", country: "Romania", lat: 44.4268, lng: 26.1025, timezone: "Europe/Bucharest", utcOffset: "UTC+2" },
  { name: "Kyiv", country: "Ukraine", lat: 50.4504, lng: 30.5245, timezone: "Europe/Kyiv", utcOffset: "UTC+2" },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241, timezone: "Africa/Johannesburg", utcOffset: "UTC+2" },
  { name: "Tel Aviv", country: "Israel", lat: 32.0853, lng: 34.7818, timezone: "Asia/Jerusalem", utcOffset: "UTC+2" },
  { name: "Beirut", country: "Lebanon", lat: 33.8938, lng: 35.5018, timezone: "Asia/Beirut", utcOffset: "UTC+2" },

  // UTC+3
  { name: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173, timezone: "Europe/Moscow", utcOffset: "UTC+3" },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784, timezone: "Europe/Istanbul", utcOffset: "UTC+3" },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lng: 36.8219, timezone: "Africa/Nairobi", utcOffset: "UTC+3" },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753, timezone: "Asia/Riyadh", utcOffset: "UTC+3" },
  { name: "Doha", country: "Qatar", lat: 25.2854, lng: 51.5310, timezone: "Asia/Qatar", utcOffset: "UTC+3" },
  { name: "Kuwait City", country: "Kuwait", lat: 29.3759, lng: 47.9774, timezone: "Asia/Kuwait", utcOffset: "UTC+3" },
  { name: "Addis Ababa", country: "Ethiopia", lat: 9.0250, lng: 38.7469, timezone: "Africa/Addis_Ababa", utcOffset: "UTC+3" },
  { name: "Baghdad", country: "Iraq", lat: 33.3152, lng: 44.3661, timezone: "Asia/Baghdad", utcOffset: "UTC+3" },
  { name: "Ankara", country: "Turkey", lat: 39.9334, lng: 32.8597, timezone: "Europe/Istanbul", utcOffset: "UTC+3" },

  // UTC+3:30
  { name: "Tehran", country: "Iran", lat: 35.6892, lng: 51.3890, timezone: "Asia/Tehran", utcOffset: "UTC+3:30" },

  // UTC+4
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, timezone: "Asia/Dubai", utcOffset: "UTC+4" },
  { name: "Abu Dhabi", country: "UAE", lat: 24.4539, lng: 54.3773, timezone: "Asia/Dubai", utcOffset: "UTC+4" },
  { name: "Muscat", country: "Oman", lat: 23.5880, lng: 58.3829, timezone: "Asia/Muscat", utcOffset: "UTC+4" },
  { name: "Baku", country: "Azerbaijan", lat: 40.4093, lng: 49.8671, timezone: "Asia/Baku", utcOffset: "UTC+4" },
  { name: "Tbilisi", country: "Georgia", lat: 41.7151, lng: 44.8271, timezone: "Asia/Tbilisi", utcOffset: "UTC+4" },

  // UTC+4:30
  { name: "Kabul", country: "Afghanistan", lat: 34.5553, lng: 69.2075, timezone: "Asia/Kabul", utcOffset: "UTC+4:30" },

  // UTC+5
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lng: 67.0011, timezone: "Asia/Karachi", utcOffset: "UTC+5" },
  { name: "Tashkent", country: "Uzbekistan", lat: 41.2995, lng: 69.2401, timezone: "Asia/Tashkent", utcOffset: "UTC+5" },
  { name: "Lahore", country: "Pakistan", lat: 31.5204, lng: 74.3587, timezone: "Asia/Karachi", utcOffset: "UTC+5" },
  { name: "Islamabad", country: "Pakistan", lat: 33.6844, lng: 73.0479, timezone: "Asia/Karachi", utcOffset: "UTC+5" },

  // UTC+5:30
  { name: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777, timezone: "Asia/Kolkata", utcOffset: "UTC+5:30" },
  { name: "Delhi", country: "India", lat: 28.7041, lng: 77.1025, timezone: "Asia/Kolkata", utcOffset: "UTC+5:30" },
  { name: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946, timezone: "Asia/Kolkata", utcOffset: "UTC+5:30" },
  { name: "Chennai", country: "India", lat: 13.0827, lng: 80.2707, timezone: "Asia/Kolkata", utcOffset: "UTC+5:30" },
  { name: "Kolkata", country: "India", lat: 22.5726, lng: 88.3639, timezone: "Asia/Kolkata", utcOffset: "UTC+5:30" },
  { name: "Hyderabad", country: "India", lat: 17.3850, lng: 78.4867, timezone: "Asia/Kolkata", utcOffset: "UTC+5:30" },
  { name: "Colombo", country: "Sri Lanka", lat: 6.9271, lng: 79.8612, timezone: "Asia/Colombo", utcOffset: "UTC+5:30" },

  // UTC+5:45
  { name: "Kathmandu", country: "Nepal", lat: 27.7172, lng: 85.3240, timezone: "Asia/Kathmandu", utcOffset: "UTC+5:45" },

  // UTC+6
  { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lng: 90.4125, timezone: "Asia/Dhaka", utcOffset: "UTC+6" },
  { name: "Almaty", country: "Kazakhstan", lat: 43.2220, lng: 76.8512, timezone: "Asia/Almaty", utcOffset: "UTC+6" },

  // UTC+6:30
  { name: "Yangon", country: "Myanmar", lat: 16.8661, lng: 96.1951, timezone: "Asia/Yangon", utcOffset: "UTC+6:30" },

  // UTC+7
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, timezone: "Asia/Bangkok", utcOffset: "UTC+7" },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456, timezone: "Asia/Jakarta", utcOffset: "UTC+7" },
  { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lng: 106.6297, timezone: "Asia/Ho_Chi_Minh", utcOffset: "UTC+7" },
  { name: "Hanoi", country: "Vietnam", lat: 21.0278, lng: 105.8342, timezone: "Asia/Ho_Chi_Minh", utcOffset: "UTC+7" },
  { name: "Phnom Penh", country: "Cambodia", lat: 11.5564, lng: 104.9282, timezone: "Asia/Phnom_Penh", utcOffset: "UTC+7" },

  // UTC+8
  { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074, timezone: "Asia/Shanghai", utcOffset: "UTC+8" },
  { name: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737, timezone: "Asia/Shanghai", utcOffset: "UTC+8" },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, timezone: "Asia/Singapore", utcOffset: "UTC+8" },
  { name: "Perth", country: "Australia", lat: -31.9505, lng: 115.8605, timezone: "Australia/Perth", utcOffset: "UTC+8" },
  { name: "Hong Kong", country: "China", lat: 22.3193, lng: 114.1694, timezone: "Asia/Hong_Kong", utcOffset: "UTC+8" },
  { name: "Taipei", country: "Taiwan", lat: 25.0330, lng: 121.5654, timezone: "Asia/Taipei", utcOffset: "UTC+8" },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lng: 101.6869, timezone: "Asia/Kuala_Lumpur", utcOffset: "UTC+8" },
  { name: "Manila", country: "Philippines", lat: 14.5995, lng: 120.9842, timezone: "Asia/Manila", utcOffset: "UTC+8" },
  { name: "Shenzhen", country: "China", lat: 22.5431, lng: 114.0579, timezone: "Asia/Shanghai", utcOffset: "UTC+8" },

  // UTC+9
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, timezone: "Asia/Tokyo", utcOffset: "UTC+9" },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780, timezone: "Asia/Seoul", utcOffset: "UTC+9" },
  { name: "Osaka", country: "Japan", lat: 34.6937, lng: 135.5023, timezone: "Asia/Tokyo", utcOffset: "UTC+9" },

  // UTC+9:30
  { name: "Adelaide", country: "Australia", lat: -34.9285, lng: 138.6007, timezone: "Australia/Adelaide", utcOffset: "UTC+9:30" },
  { name: "Darwin", country: "Australia", lat: -12.4634, lng: 130.8456, timezone: "Australia/Darwin", utcOffset: "UTC+9:30" },

  // UTC+10
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, timezone: "Australia/Sydney", utcOffset: "UTC+10" },
  { name: "Melbourne", country: "Australia", lat: -37.8136, lng: 144.9631, timezone: "Australia/Melbourne", utcOffset: "UTC+10" },
  { name: "Brisbane", country: "Australia", lat: -27.4698, lng: 153.0251, timezone: "Australia/Brisbane", utcOffset: "UTC+10" },

  // UTC+11
  { name: "Noumea", country: "New Caledonia", lat: -22.2558, lng: 166.4505, timezone: "Pacific/Noumea", utcOffset: "UTC+11" },
  { name: "Solomon Islands", country: "Solomon Islands", lat: -9.4456, lng: 159.9729, timezone: "Pacific/Guadalcanal", utcOffset: "UTC+11" },

  // UTC+12
  { name: "Auckland", country: "New Zealand", lat: -36.8485, lng: 174.7633, timezone: "Pacific/Auckland", utcOffset: "UTC+12" },
  { name: "Wellington", country: "New Zealand", lat: -41.2865, lng: 174.7762, timezone: "Pacific/Auckland", utcOffset: "UTC+12" },
  { name: "Fiji", country: "Fiji", lat: -17.7134, lng: 178.0650, timezone: "Pacific/Fiji", utcOffset: "UTC+12" },

  // UTC+13
  { name: "Apia", country: "Samoa", lat: -13.8333, lng: -171.7500, timezone: "Pacific/Apia", utcOffset: "UTC+13" },
  { name: "Nuku'alofa", country: "Tonga", lat: -21.2087, lng: -175.1982, timezone: "Pacific/Tongatapu", utcOffset: "UTC+13" },
];

// Color palette for timezone bands — every offset has a unique color
export const timezoneColors: Record<string, string> = {
  "UTC-12": "#6366f1",
  "UTC-11": "#7c83f7",
  "UTC-10": "#8b5cf6",
  "UTC-9:30": "#9775e0",
  "UTC-9": "#a78bfa",
  "UTC-8": "#c084fc",
  "UTC-7": "#d946ef",
  "UTC-6": "#e879f9",
  "UTC-5": "#f472b6",
  "UTC-4": "#fb7185",
  "UTC-3:30": "#f45f5f",
  "UTC-3": "#f87171",
  "UTC-2": "#fb923c",
  "UTC-1": "#fbbf24",
  "UTC+0": "#facc15",
  "UTC+1": "#a3e635",
  "UTC+2": "#4ade80",
  "UTC+3": "#34d399",
  "UTC+3:30": "#2dd4bf",
  "UTC+4": "#22d3ee",
  "UTC+4:30": "#06b6d4",
  "UTC+5": "#38bdf8",
  "UTC+5:30": "#0ea5e9",
  "UTC+5:45": "#0284c7",
  "UTC+6": "#60a5fa",
  "UTC+6:30": "#3b82f6",
  "UTC+7": "#818cf8",
  "UTC+8": "#6d28d9",
  "UTC+8:45": "#7e2bd0",
  "UTC+9": "#9333ea",
  "UTC+9:30": "#a855f7",
  "UTC+10": "#c026d3",
  "UTC+10:30": "#d4219e",
  "UTC+11": "#db2777",
  "UTC+12": "#e11d48",
  "UTC+13": "#dc2626",
  "UTC+13:45": "#b91c1c",
  "UTC+14": "#991b1b",
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

    // Use fixed Etc/GMT zones so labels always match their UTC offset
    // (city timezones shift with DST, causing label mismatches)
    const timezone = offset === 0 ? "Etc/GMT" : `Etc/GMT${offset < 0 ? "+" : "-"}${Math.abs(offset)}`;

    return { utcOffset: key, lng, timezone };
  }
);

export function getUtcOffsetKey(tzid: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tzid,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    if (tzPart === "GMT") return "UTC+0";
    return tzPart.replace("GMT", "UTC");
  } catch {
    return "";
  }
}

// Map country name to ISO 3166-1 alpha-2 code for flag emoji
const countryToCode: Record<string, string> = {
  "US": "US", "United States": "US", "United States of America": "US",
  "UK": "GB", "United Kingdom": "GB", "Canada": "CA",
  "Mexico": "MX", "Colombia": "CO", "Chile": "CL", "Venezuela": "VE",
  "Brazil": "BR", "Argentina": "AR", "Peru": "PE", "Cuba": "CU",
  "Panama": "PA", "Bolivia": "BO", "Uruguay": "UY",
  "Dominican Republic": "DO", "Guatemala": "GT", "Costa Rica": "CR",
  "France": "FR", "Germany": "DE", "Spain": "ES", "Italy": "IT",
  "Netherlands": "NL", "Belgium": "BE", "Austria": "AT", "Switzerland": "CH",
  "Sweden": "SE", "Norway": "NO", "Denmark": "DK", "Finland": "FI",
  "Poland": "PL", "Czech Republic": "CZ", "Romania": "RO",
  "Portugal": "PT", "Ireland": "IE", "Iceland": "IS", "Greece": "GR",
  "Turkey": "TR", "Ukraine": "UA", "Russia": "RU",
  "Egypt": "EG", "South Africa": "ZA", "Nigeria": "NG", "Kenya": "KE",
  "Ghana": "GH", "Ethiopia": "ET", "Morocco": "MA", "Algeria": "DZ",
  "Saudi Arabia": "SA", "UAE": "AE", "Qatar": "QA", "Kuwait": "KW",
  "Israel": "IL", "Lebanon": "LB", "Iraq": "IQ", "Iran": "IR",
  "Oman": "OM", "Azerbaijan": "AZ", "Georgia": "GE", "Afghanistan": "AF",
  "Pakistan": "PK", "India": "IN", "Nepal": "NP", "Sri Lanka": "LK",
  "Bangladesh": "BD", "Myanmar": "MM", "Thailand": "TH", "Vietnam": "VN",
  "Cambodia": "KH", "Indonesia": "ID", "Malaysia": "MY", "Singapore": "SG",
  "Philippines": "PH", "China": "CN", "Taiwan": "TW",
  "Japan": "JP", "South Korea": "KR", "Australia": "AU",
  "New Zealand": "NZ", "Fiji": "FJ", "Samoa": "WS",
  "Uzbekistan": "UZ", "Kazakhstan": "KZ", "Tonga": "TO",
  "Hong Kong": "HK", "American Samoa": "AS", "Cape Verde": "CV",
  "New Caledonia": "NC", "Solomon Islands": "SB",
};

export function countryFlag(country: string): string {
  const code = countryToCode[country];
  if (!code) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}
