/**
 * Parse a time string like "6pm", "6 pm", "14:00", "14", "3:30pm"
 * Returns { hour (0-23), minute } or null.
 */
export function parseTime(raw: string): { hour: number; minute: number } | null {
  const trimmed = raw.trim();

  // Match patterns: "6pm", "6 pm", "6:30pm", "6:30 pm", "14:00", "14", "3:30"
  const match = trimmed.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i
  );
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3]?.toLowerCase();

  if (minute < 0 || minute > 59) return null;

  // Reject invalid 12-hour values like "13pm" or "0am"
  if (ampm && (hour < 1 || hour > 12)) return null;

  if (ampm === "pm" && hour < 12) hour += 12;
  if (ampm === "am" && hour === 12) hour = 0;

  // No am/pm: if hour > 23 it's invalid
  if (hour < 0 || hour > 23) return null;

  return { hour, minute };
}
