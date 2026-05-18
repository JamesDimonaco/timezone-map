import Link from "next/link";
import {
  type TimezoneCity,
  countryFlag,
  getRelatedCities,
  getContrastTextColor,
} from "@/lib/timezones";
import { cityToSlug, getPopularComparisons } from "@/lib/slugs";
import { TimeDisplay } from "@/components/time-display";
import { CityCurrentTimeText } from "@/components/city-current-time-text";
import { CityTodayBlock } from "@/components/city-today-block";
import { CityDstBlock } from "@/components/city-dst-block";
import { CityHubsBlock } from "@/components/city-hubs-block";
import { CityNearbyBlock } from "@/components/city-nearby-block";
import { FaqList } from "@/components/faq-list";
import { AdBanner } from "@/components/ad-banner";
import { SiteFooter } from "@/components/site-footer";
import { getDstInfo } from "@/lib/dst";

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

  const baseUrl = "https://timezones.live";

  const faqCurrentYear = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: city.timezone,
      year: "numeric",
    }).format(new Date()),
    10,
  );
  const faqDstInfo = getDstInfo(city.timezone, faqCurrentYear);
  const springForward = faqDstInfo.transitions.find(
    (t) => t.type === "spring-forward",
  );
  const fallBack = faqDstInfo.transitions.find((t) => t.type === "fall-back");
  const formatFaqDate = (instant: Date) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: city.timezone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(instant);
  const formatFaqTime = (instant: Date) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: city.timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(instant);

  const faqEntries: { question: string; answer: string }[] = [
    {
      question: `What time is it in ${city.name} right now?`,
      answer: `The current time in ${city.name}, ${city.country} can be seen at the top of this page. ${city.name} observes the ${city.timezone} timezone, with a standard UTC offset of ${city.utcOffset}.`,
    },
    {
      question: `What timezone is ${city.name} in?`,
      answer: `${city.name}, ${city.country} is in the ${city.timezone} timezone.`,
    },
    {
      question: `What is the UTC offset for ${city.name}?`,
      answer: `${city.name} has a standard UTC offset of ${city.utcOffset}.`,
    },
    {
      question: `Does ${city.name} observe daylight saving time?`,
      answer: faqDstInfo.observes
        ? `Yes. ${city.name} observes daylight saving time, shifting its local clock by one hour twice a year.`
        : `No. ${city.name} does not observe daylight saving time. Its local time stays at ${city.utcOffset} all year.`,
    },
    ...(springForward
      ? [
          {
            question: `When does daylight saving time start in ${city.name} in ${faqCurrentYear}?`,
            answer: `In ${faqCurrentYear}, ${city.name} springs forward on ${formatFaqDate(springForward.instant)} at ${formatFaqTime(springForward.instant)} local time.`,
          },
        ]
      : []),
    ...(fallBack
      ? [
          {
            question: `When does daylight saving time end in ${city.name} in ${faqCurrentYear}?`,
            answer: `In ${faqCurrentYear}, ${city.name} falls back on ${formatFaqDate(fallBack.instant)} at ${formatFaqTime(fallBack.instant)} local time.`,
          },
        ]
      : []),
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cities",
        item: `${baseUrl}/time`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: city.name,
        item: `${baseUrl}/time/${slug}`,
      },
    ],
  };

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "City",
    name: city.name,
    ...(typeof city.lat === "number" && typeof city.lng === "number"
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: city.lat,
            longitude: city.lng,
          },
        }
      : {}),
    ...(city.country
      ? {
          containedInPlace: {
            "@type": "Country",
            name: city.country,
          },
        }
      : {}),
    url: `${baseUrl}/time/${slug}`,
  };

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
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
            What time is it in {city.name} right now?
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
            href={`/?lat=${city.lat}&lng=${city.lng}&zoom=5&city=${encodeURIComponent(city.name)}`}
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

        {/* About this timezone */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">
            About the {city.name} timezone
          </h2>
          <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <CityCurrentTimeText city={city} />
            <p>
              {city.name} is located in {city.country} at{" "}
              {Math.abs(city.lat).toFixed(2)}°
              {city.lat >= 0 ? "N" : "S"}, {Math.abs(city.lng).toFixed(2)}°
              {city.lng >= 0 ? "E" : "W"}. View {city.name} on the interactive
              map or compare its time with any other city using the links
              below.
            </p>
          </div>
        </section>

        {/* Today: sun times */}
        <CityTodayBlock city={city} />

        {/* DST schedule */}
        <CityDstBlock city={city} />

        {/* Working with major hubs */}
        <CityHubsBlock city={city} />

        {/* Ad */}
        <AdBanner className="mb-10" />

        {/* Nearby cities */}
        <CityNearbyBlock city={city} />

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

        {/* FAQ */}
        <div className="mt-10">
          <FaqList items={faqEntries} />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
