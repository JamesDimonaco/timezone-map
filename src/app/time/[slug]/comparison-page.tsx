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
import { ComparisonOverlapBlock } from "@/components/comparison-overlap-block";
import { ComparisonDstBlock } from "@/components/comparison-dst-block";
import { ComparisonDistanceBlock } from "@/components/comparison-distance-block";
import { FaqList } from "@/components/faq-list";
import { AdBanner } from "@/components/ad-banner";
import { SiteFooter } from "@/components/site-footer";
import { analyzeCityPair } from "@/lib/comparison";
import { formatLocalHour } from "@/lib/major-hubs";
import { formatDistanceKm } from "@/lib/distance";

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

  const analysis = analyzeCityPair(cityA, cityB);

  const liveDiff = analysis.hourDifference;
  const aheadBehindLive =
    liveDiff > 0
      ? `${cityA.name} is currently ${formatHourDifference(Math.abs(liveDiff))} ahead of ${cityB.name}`
      : liveDiff < 0
        ? `${cityA.name} is currently ${formatHourDifference(Math.abs(liveDiff))} behind ${cityB.name}`
        : `${cityA.name} and ${cityB.name} are currently at the same time`;

  const ninePlannerRow = analysis.planner.find((r) => r.aHour === 9);
  const whenA9inB = ninePlannerRow
    ? formatLocalHour(ninePlannerRow.bHour)
    : null;

  const dstAnswer = (() => {
    switch (analysis.dst.kind) {
      case "both-fixed":
        return `Neither ${cityA.name} nor ${cityB.name} observes daylight saving time. The difference between them stays constant year-round.`;
      case "same-schedule":
        return `Both ${cityA.name} and ${cityB.name} observe daylight saving time on the same dates, so their time difference does not change during the year.`;
      case "one-observes":
        return `${analysis.dst.observerLabel === "A" ? cityA.name : cityB.name} observes daylight saving time, but ${analysis.dst.observerLabel === "A" ? cityB.name : cityA.name} does not — the difference between the two cities changes by one hour around the DST transition dates.`;
      case "different-schedules":
        return `${cityA.name} and ${cityB.name} both observe daylight saving time, but on different schedules. Short windows each year (a week or two around each set of transitions) produce a temporarily different offset.`;
    }
  })();

  const meetingAnswer = analysis.overlap.hours > 0
    ? `The best window is ${formatLocalHour(analysis.overlap.aStart!)}–${formatLocalHour(analysis.overlap.aEnd!)} in ${cityA.name}, which is ${formatLocalHour(analysis.overlap.bStart!)}–${formatLocalHour(analysis.overlap.bEnd!)} in ${cityB.name}. That's ${analysis.overlap.hours.toFixed(analysis.overlap.hours % 1 === 0 ? 0 : 1)} hours where both teams are inside standard 9-to-5 working hours.`
    : `Standard 9-to-5 working hours in ${cityA.name} and ${cityB.name} do not overlap. To meet synchronously, one side will need to start before 9 AM or work past 5 PM — see the planner above for the least disruptive options.`;

  const faqEntries: { question: string; answer: string }[] = [
    {
      question: `What is the time difference between ${cityA.name} and ${cityB.name}?`,
      answer: `The current time difference is ${formatHourDifference(Math.abs(liveDiff))}. ${aheadBehindLive}.`,
    },
    {
      question: `Is ${cityA.name} ahead of ${cityB.name}?`,
      answer:
        liveDiff > 0
          ? `Yes. ${cityA.name} is currently ${formatHourDifference(Math.abs(liveDiff))} ahead of ${cityB.name}.`
          : liveDiff < 0
            ? `No. ${cityA.name} is currently ${formatHourDifference(Math.abs(liveDiff))} behind ${cityB.name}.`
            : `${cityA.name} and ${cityB.name} are currently at the same time.`,
    },
    ...(whenA9inB
      ? [
          {
            question: `What time is it in ${cityB.name} when it's 9 AM in ${cityA.name}?`,
            answer: `When it's 9 AM in ${cityA.name}, it's ${whenA9inB} in ${cityB.name}.`,
          },
        ]
      : []),
    {
      question: `When is the best time to schedule a meeting between ${cityA.name} and ${cityB.name}?`,
      answer: meetingAnswer,
    },
    {
      question: `Do ${cityA.name} and ${cityB.name} observe daylight saving time?`,
      answer: dstAnswer,
    },
    {
      question: `How far apart are ${cityA.name} and ${cityB.name}?`,
      answer: `${cityA.name} and ${cityB.name} are ${formatDistanceKm(analysis.distanceKm)} apart along the great-circle route.${analysis.flightHours > 0 ? ` A direct flight takes roughly ${Math.floor(analysis.flightHours)} hour${Math.floor(analysis.flightHours) === 1 ? "" : "s"} ${Math.round((analysis.flightHours - Math.floor(analysis.flightHours)) * 60)} minutes.` : ""}`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.answer,
      },
    })),
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

        {/* About this comparison */}
        <section className="mt-10 mb-8">
          <h2 className="text-lg font-semibold mb-3">
            {cityA.name} vs {cityB.name} timezone guide
          </h2>
          <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <p>
              {cityA.name} ({cityA.country}) uses the{" "}
              <strong className="text-foreground">{cityA.timezone}</strong>{" "}
              timezone at {cityA.utcOffset}, while {cityB.name} ({cityB.country}){" "}
              uses{" "}
              <strong className="text-foreground">{cityB.timezone}</strong>{" "}
              at {cityB.utcOffset}.{" "}
              {staticDiff !== 0
                ? `This means ${staticAheadBehind} (based on standard offsets — the live difference above accounts for daylight saving time).`
                : `Both cities share the same standard UTC offset, though daylight saving rules may cause a temporary difference during parts of the year.`}
            </p>
          </div>
        </section>

        {/* Meeting times + planner */}
        <ComparisonOverlapBlock
          cityA={cityA}
          cityB={cityB}
          analysis={analysis}
        />

        {/* DST behavior */}
        <ComparisonDstBlock
          cityA={cityA}
          cityB={cityB}
          analysis={analysis}
        />

        {/* Distance & flight time */}
        <ComparisonDistanceBlock
          cityA={cityA}
          cityB={cityB}
          analysis={analysis}
        />

        {/* Ad */}
        <AdBanner className="mb-8" />

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

        {/* FAQ */}
        <div className="mt-10">
          <FaqList items={faqEntries} />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
