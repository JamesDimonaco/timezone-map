"use client";

import { useEffect, useRef, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Check, Link2, Plus, RotateCcw, X } from "lucide-react";
import { countryFlag, searchCities } from "@/lib/timezones";
import { parseTime } from "@/lib/parse-time";
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
} from "@/lib/share-time";

const STEP = 30;
const SLIDER_MAX = 24 * 60 - STEP;

function formatMinutes(minutesOfDay: number): string {
  const h = Math.floor(minutesOfDay / 60);
  const m = minutesOfDay % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

function formatDay(day: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(day * 86_400_000);
}

export function ShareTimeView({ shared }: { shared: Place }) {
  const posthog = usePostHog();
  const sharedSlug = placeSlug(shared);
  // null until mount, so the server and first client render agree.
  const [now, setNow] = useState<number | null>(null);
  // null = follow the live clock.
  const [picked, setPicked] = useState<number | null>(null);
  const [viewer, setViewer] = useState<Place | null>(null);
  const [added, setAdded] = useState<Place[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = Date.now();
    setNow(t);
    setViewer(placeForTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone, t));
    setAdded(parseWithParam(new URLSearchParams(window.location.search).get("with")));
  }, []);

  // Tick only while following the live clock; a picked time doesn't move.
  useEffect(() => {
    if (picked !== null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [picked]);

  // Added rows live in ?with= so a reload keeps them. The viewer's own row stays out of
  // the URL bar, so each person sees their own city, but the copied link includes it.
  useEffect(() => {
    if (now === null) return;
    const url = new URL(window.location.href);
    if (added.length) url.searchParams.set("with", added.map(placeSlug).join(","));
    else url.searchParams.delete("with");
    window.history.replaceState(null, "", url.toString());
    // Only re-sync when the rows change, not on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [added]);

  const instant = picked ?? now;

  const rows = buildRows(shared, viewer, added);
  const seen = new Set(rows.map((r) => placeSlug(r.place)));

  const baseDay = instant === null ? 0 : wallClock(shared, instant).day;

  const setRowTime = (place: Place, minutesOfDay: number) => {
    if (instant === null) return;
    setPicked(setWallTime(place, instant, minutesOfDay));
  };

  const copyLink = async () => {
    try {
      const url = new URL(`/compare/${sharedSlug}`, window.location.origin);
      const others = rows.slice(1).map((r) => placeSlug(r.place));
      if (others.length) url.searchParams.set("with", others.join(","));
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      posthog?.capture("share_time_link_copied", { place: sharedSlug, rows: rows.length, source: "compare_page" });
    } catch {
      // Clipboard blocked: the URL bar still has the link.
    }
  };

  return (
    <div className="space-y-3">
      {rows.map(({ place, role }) => (
        <PlaceRow
          key={placeSlug(place)}
          place={place}
          role={role}
          instant={instant}
          baseDay={baseDay}
          onTime={(m) => setRowTime(place, m)}
          onSwap={
            role === "viewer"
              ? (p) => {
                  // Picking the shared place would merge the row away, and its swap link with it.
                  if (placeSlug(p) !== sharedSlug) setViewer(p);
                }
              : undefined
          }
          onRemove={
            role === "added"
              ? () => setAdded((prev) => prev.filter((p) => placeSlug(p) !== placeSlug(place)))
              : undefined
          }
        />
      ))}

      {rows.length < MAX_ROWS && now !== null && (
        <PlacePicker
          label="Add a city"
          icon={<Plus className="h-4 w-4" />}
          onPick={(p) => {
            if (!seen.has(placeSlug(p))) setAdded((prev) => [...prev, p]);
          }}
        />
      )}

      <div className="flex flex-wrap items-center gap-3 pt-3">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Link copied" : "Copy link"}
        </button>
        {picked !== null && (
          <button
            type="button"
            onClick={() => {
              // `now` froze while a time was picked; refresh it so "Now" isn't stale for a tick.
              setNow(Date.now());
              setPicked(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Now
          </button>
        )}
      </div>
    </div>
  );
}

function PlaceRow({
  place,
  role,
  instant,
  baseDay,
  onTime,
  onSwap,
  onRemove,
}: {
  place: Place;
  role: "shared" | "viewer" | "added";
  instant: number | null;
  baseDay: number;
  onTime: (minutesOfDay: number) => void;
  onSwap?: (place: Place) => void;
  onRemove?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [draft, setDraft] = useState("");
  // Unmounting the input fires blur, which would commit a draft Escape meant to cancel.
  const cancelled = useRef(false);
  const initialDraft = useRef("");

  const clock = instant === null ? null : wallClock(place, instant);
  const offset = instant === null ? null : formatUtcOffset(offsetMinutesAt(place, instant));
  const dayDiff = clock ? clock.day - baseDay : 0;

  const commit = () => {
    // An untouched draft is just the time already shown; committing it would freeze the clock.
    if (cancelled.current || draft === initialDraft.current) {
      setEditing(false);
      return;
    }
    const t = parseTime(draft);
    if (t) onTime(t.hour * 60 + t.minute);
    setEditing(false);
  };

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">
            {place.kind === "city" && <span className="mr-1.5">{countryFlag(place.city.country)}</span>}
            {placeLabel(place)}
            {role === "viewer" && <span className="ml-2 text-xs text-muted-foreground">You</span>}
          </div>
          <div className="text-xs text-muted-foreground">
            {offset ?? " "}
            {clock && ` · ${formatDay(clock.day)}`}
            {dayDiff !== 0 && (
              <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
                {dayDiff > 0 ? `+${dayDiff}` : dayDiff} day
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") {
                  cancelled.current = true;
                  setEditing(false);
                }
              }}
              placeholder="7:15 pm"
              aria-label={`Type a time for ${placeLabel(place)}`}
              className="w-28 rounded-md border bg-background px-2 py-1 text-right font-mono text-xl focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <button
              type="button"
              disabled={!clock}
              onClick={() => {
                const shown = clock ? formatMinutes(clock.minutesOfDay) : "";
                setDraft(shown);
                initialDraft.current = shown;
                cancelled.current = false;
                setEditing(true);
              }}
              title="Tap to type a time"
              className="font-mono text-2xl font-semibold tabular-nums hover:text-primary transition-colors"
            >
              {clock ? formatMinutes(clock.minutesOfDay) : "--:--"}
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${placeLabel(place)}`}
              className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={SLIDER_MAX}
        step={STEP}
        disabled={!clock}
        value={clock ? Math.min(Math.round(clock.minutesOfDay / STEP) * STEP, SLIDER_MAX) : 0}
        onChange={(e) => onTime(Number(e.target.value))}
        aria-label={`Time in ${placeLabel(place)}`}
        className="mt-3 w-full accent-primary"
      />

      {onSwap &&
        (swapping ? (
          <div className="mt-2">
            <PlacePicker
              label="Change your city"
              autoFocus
              onPick={(p) => {
                onSwap(p);
                setSwapping(false);
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSwapping(true)}
            className="mt-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Not your city? Change it
          </button>
        ))}
    </div>
  );
}

function PlacePicker({
  label,
  icon,
  autoFocus,
  onPick,
}: {
  label: string;
  icon?: React.ReactNode;
  autoFocus?: boolean;
  onPick: (place: Place) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim();
  const utc = /^utc/i.test(q) ? parsePlaceSlug(q.replace(/\s+/g, "")) : null;
  const results: Place[] = [
    ...(utc ? [utc] : []),
    ...searchCities(q)
      .slice(0, 6)
      .map((city): Place => ({ kind: "city", city })),
  ];

  const pick = (place: Place) => {
    onPick(place);
    setQuery("");
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-dashed bg-card px-3 py-2.5 text-sm">
        {icon}
        <input
          type="search"
          autoFocus={autoFocus}
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`${label} (city or UTC+5)`}
          aria-label={label}
          className="w-full bg-transparent placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      {q && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border bg-popover shadow-lg">
          {results.map((place) => (
            <li key={placeSlug(place)}>
              <button
                type="button"
                onClick={() => pick(place)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span>
                  {place.kind === "city" && <span className="mr-1.5">{countryFlag(place.city.country)}</span>}
                  {placeLabel(place)}
                  {place.kind === "city" && (
                    <span className="ml-1.5 text-muted-foreground">{place.city.country}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
