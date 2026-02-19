import Link from "next/link";
import {
  type TimezoneCity,
  countryFlag,
  getRelatedCities,
  getContrastTextColor,
} from "@/lib/timezones";
import { cityToSlug, getPopularComparisons } from "@/lib/slugs";
import { TimeDisplay } from "@/components/time-display";

export function CityPage({
  city,
  color,
  slug,
}: {
  city: TimezoneCity;
  color: string;
  slug: string;
}) {
  const flag = countryFlag(city.country);
  const relatedCities = getRelatedCities(city);
  const popularComparisons = getPopularComparisons(city.name, 8);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What timezone is ${city.name} in?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${city.name}, ${city.country} is in the ${city.timezone} timezone.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the UTC offset for ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${city.name} has a UTC offset of ${city.utcOffset}.`,
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

      {/* Color accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

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
          <div className="text-4xl mb-3">{flag}</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Current Time in {city.name}, {city.country}
          </h1>
        </div>

        {/* Live clock */}
        <div className="flex justify-center mb-10">
          <TimeDisplay timezone={city.timezone} color={color} />
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Timezone
            </div>
            <div className="font-mono text-sm font-medium">{city.timezone}</div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              UTC Offset
            </div>
            <div className="flex items-center justify-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="font-mono text-sm font-medium">
                {city.utcOffset}
              </span>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Coordinates
            </div>
            <div className="font-mono text-sm font-medium">
              {city.lat.toFixed(2)}, {city.lng.toFixed(2)}
            </div>
          </div>
        </div>

        {/* View on map CTA */}
        <div className="flex justify-center mb-12">
          <Link
            href={`/?lat=${city.lat}&lng=${city.lng}&zoom=5`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: color,
              color: getContrastTextColor(color),
            }}
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
            View on map
          </Link>
        </div>

        {/* Related cities */}
        {relatedCities.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Other cities in {city.utcOffset}
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedCities.map((related) => (
                <Link
                  key={related.name}
                  href={`/time/${cityToSlug(related.name)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm hover:bg-accent transition-colors"
                >
                  <span>{countryFlag(related.country)}</span>
                  {related.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Compare with other cities */}
        {popularComparisons.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-4">
              Compare {city.name} with other cities
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularComparisons.map(({ slug: compSlug, otherCity }) => (
                <Link
                  key={compSlug}
                  href={`/time/${compSlug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm hover:bg-accent transition-colors"
                >
                  {city.name} to {otherCity}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
