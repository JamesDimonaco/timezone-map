import Link from "next/link";
import { type TimezoneCity, countryFlag } from "@/lib/timezones";
import {
  cityToSlug,
  formatHourDifference,
  parseUtcOffsetHours,
  getPopularComparisons,
} from "@/lib/slugs";
import { TimeComparisonDisplay } from "@/components/time-comparison-display";
import { TimeDifferenceCard } from "@/components/time-difference-card";

export function ComparisonPage({
  cityA,
  cityB,
  colorA,
  colorB,
  slug,
}: {
  cityA: TimezoneCity;
  cityB: TimezoneCity;
  colorA: string;
  colorB: string;
  slug: string;
}) {
  // Static diff from utcOffset strings — deterministic, DST-independent.
  // Used only for structured data; live diff is rendered by the client component.
  const staticDiff =
    parseUtcOffsetHours(cityB.utcOffset) -
    parseUtcOffsetHours(cityA.utcOffset);
  const staticDiffText = formatHourDifference(staticDiff);
  const staticAheadBehind =
    staticDiff > 0
      ? `${cityB.name} is ${staticDiffText} ahead of ${cityA.name}`
      : staticDiff < 0
        ? `${cityB.name} is ${formatHourDifference(Math.abs(staticDiff))} behind ${cityA.name}`
        : `${cityA.name} and ${cityB.name} are in the same timezone`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the time difference between ${cityA.name} and ${cityB.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The time difference between ${cityA.name} (${cityA.utcOffset}) and ${cityB.name} (${cityB.utcOffset}) is ${staticDiffText}. ${staticAheadBehind}.`,
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Dual-color accent bar */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1" style={{ backgroundColor: colorA }} />
        <div className="flex-1" style={{ backgroundColor: colorB }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to map
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            Time Difference: {cityA.name} to {cityB.name}
          </h1>

          {/* Flags + offset badges */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{countryFlag(cityA.country)}</span>
              <span className="text-sm font-medium">{cityA.name}</span>
              <span
                className="px-2 py-0.5 rounded text-xs font-mono font-medium"
                style={{
                  backgroundColor: `${colorA}20`,
                  color: colorA,
                  border: `1px solid ${colorA}40`,
                }}
              >
                {cityA.utcOffset}
              </span>
            </div>
            <span className="text-muted-foreground text-sm">vs</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{countryFlag(cityB.country)}</span>
              <span className="text-sm font-medium">{cityB.name}</span>
              <span
                className="px-2 py-0.5 rounded text-xs font-mono font-medium"
                style={{
                  backgroundColor: `${colorB}20`,
                  color: colorB,
                  border: `1px solid ${colorB}40`,
                }}
              >
                {cityB.utcOffset}
              </span>
            </div>
          </div>
        </div>

        {/* Live dual clocks */}
        <div className="flex justify-center mb-10">
          <TimeComparisonDisplay
            cityA={cityA}
            cityB={cityB}
            colorA={colorA}
            colorB={colorB}
          />
        </div>

        {/* Live difference card (client component — DST-aware) */}
        <TimeDifferenceCard
          timezoneA={cityA.timezone}
          timezoneB={cityB.timezone}
          cityNameA={cityA.name}
          cityNameB={cityB.name}
        />

        {/* Compare on map CTA */}
        <div className="flex justify-center mb-10">
          <Link
            href={`/?compare=${encodeURIComponent(cityA.name)},${encodeURIComponent(cityB.name)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <circle
                cx="8"
                cy="8"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M1.5 8H14.5M8 1.5C9.5 3.5 10 5.5 10 8C10 10.5 9.5 12.5 8 14.5M8 1.5C6.5 3.5 6 5.5 6 8C6 10.5 6.5 12.5 8 14.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Compare on map
          </Link>
        </div>

        {/* Links to individual city pages */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href={`/time/${cityToSlug(cityA.name)}`}
            className="rounded-lg border bg-card p-4 text-center hover:bg-accent transition-colors"
          >
            <div className="text-lg mb-1">{countryFlag(cityA.country)}</div>
            <div className="text-sm font-medium">{cityA.name}</div>
            <div className="text-xs text-muted-foreground">View city page</div>
          </Link>
          <Link
            href={`/time/${cityToSlug(cityB.name)}`}
            className="rounded-lg border bg-card p-4 text-center hover:bg-accent transition-colors"
          >
            <div className="text-lg mb-1">{countryFlag(cityB.country)}</div>
            <div className="text-sm font-medium">{cityB.name}</div>
            <div className="text-xs text-muted-foreground">View city page</div>
          </Link>
        </div>

        {/* More comparisons */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">More comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {[
              ...getPopularComparisons(cityA.name, 4)
                .filter(({ otherCity }) => otherCity !== cityB.name)
                .slice(0, 4)
                .map(({ slug: s, otherCity }) => ({
                  slug: s,
                  label: `${cityA.name} to ${otherCity}`,
                })),
              ...getPopularComparisons(cityB.name, 4)
                .filter(({ otherCity }) => otherCity !== cityA.name)
                .slice(0, 4)
                .map(({ slug: s, otherCity }) => ({
                  slug: s,
                  label: `${cityB.name} to ${otherCity}`,
                })),
            ].map(({ slug: s, label }) => (
              <Link
                key={s}
                href={`/time/${s}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
