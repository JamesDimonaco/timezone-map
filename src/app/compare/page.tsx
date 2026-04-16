import type { Metadata } from "next";
import Link from "next/link";
import {
  cityToSlug,
  canonicalComparisonSlug,
} from "@/lib/slugs";
import { timezoneCities, countryFlag } from "@/lib/timezones";
import { AdBanner } from "@/components/ad-banner";
import { SiteFooter } from "@/components/site-footer";
import {
  CompareSearch,
  type ComparisonItem,
  type CityItem,
} from "./compare-search";

export const metadata: Metadata = {
  title:
    "Team Time Zones — Compare Cities & Find Meeting Times | Timezones.live",
  description:
    "Free timezone converter for remote teams. Compare up to 5 cities, find overlapping work hours, and share a link with your team.",
  keywords:
    "team timezone converter, remote team time zones, timezone meeting planner",
  alternates: { canonical: "https://timezones.live/compare" },
  openGraph: {
    title:
      "Team Time Zones — Compare Cities & Find Meeting Times | Timezones.live",
    description:
      "Free timezone converter for remote teams. Compare up to 5 cities, find overlapping work hours, and share a link with your team.",
    url: "https://timezones.live/compare",
    type: "website",
  },
};

const POPULAR_COMPARISONS = [
  ["New York", "London"],
  ["New York", "Tokyo"],
  ["London", "Tokyo"],
  ["New York", "Los Angeles"],
  ["London", "Dubai"],
  ["Sydney", "London"],
  ["New York", "Singapore"],
  ["London", "Berlin"],
  ["Tokyo", "Seoul"],
  ["Dubai", "Mumbai"],
  ["Chicago", "London"],
  ["San Francisco", "Tokyo"],
] as const;

const TOP_CITIES = [
  "New York",
  "London",
  "Tokyo",
  "Sydney",
  "Dubai",
  "Singapore",
  "Hong Kong",
  "Los Angeles",
  "Paris",
  "Berlin",
  "Mumbai",
  "Shanghai",
  "Seoul",
  "Toronto",
  "São Paulo",
  "Chicago",
  "Istanbul",
  "Bangkok",
  "San Francisco",
  "Cairo",
];

function getComparisonSlug(nameA: string, nameB: string): string {
  const a = timezoneCities.find((c) => c.name === nameA);
  const b = timezoneCities.find((c) => c.name === nameB);
  if (!a || !b) return "";
  return canonicalComparisonSlug(a, b);
}

export default function ComparePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I compare time zones for my remote team?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Add up to 5 cities to the comparison panel on Timezones.live. The tool shows overlapping work hours and lets you share a direct link with your team — no sign-up required.",
        },
      },
      {
        "@type": "Question",
        name: "Can I share a timezone comparison link?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Every comparison generates a unique URL (e.g. timezones.live/?compare=London,Tokyo) that you can share with anyone. They will see the same cities and time comparison.",
        },
      },
      {
        "@type": "Question",
        name: "Does the tool account for daylight saving time?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All clocks are live and automatically adjust for daylight saving time changes in each city's timezone.",
        },
      },
    ],
  };

  // Pre-compute comparison data for the client component
  const comparisons: ComparisonItem[] = POPULAR_COMPARISONS.flatMap(([a, b]) => {
    const slug = getComparisonSlug(a, b);
    if (!slug) return [];
    return [{ cityA: a, cityB: b, slug }];
  });

  const cityItems: CityItem[] = TOP_CITIES.flatMap((name) => {
    const city = timezoneCities.find((c) => c.name === name);
    if (!city) return [];
    return [{ name, flag: countryFlag(city.country), slug: cityToSlug(name) }];
  });

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        {/* Navigation */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
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
            Map
          </Link>
          <span className="text-muted-foreground/40">|</span>
          <Link
            href="/time"
            className="hover:text-foreground transition-colors"
          >
            Cities
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Compare Time Zones for Remote Teams
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Find the best meeting time across cities. Compare up to 5
            time zones, see overlapping work hours, and share a link with your
            team — no sign-up needed.
          </p>
        </div>

        {/* Quick-start presets */}
        <div className="mb-12">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Quick start
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/?compare=New York,Los Angeles"
              className="px-4 py-2 rounded-full border text-sm font-medium hover:bg-accent transition-colors"
            >
              US Coasts
            </Link>
            <Link
              href="/?compare=New York,London"
              className="px-4 py-2 rounded-full border text-sm font-medium hover:bg-accent transition-colors"
            >
              US + Europe
            </Link>
            <Link
              href="/?compare=New York,London,Tokyo"
              className="px-4 py-2 rounded-full border text-sm font-medium hover:bg-accent transition-colors"
            >
              Global
            </Link>
          </div>
        </div>

        {/* Search + filtered sections (client component) */}
        <CompareSearch comparisons={comparisons} cities={cityItems} />

        {/* Ad */}
        <AdBanner className="my-12" />

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="font-medium text-sm mb-1">
                Overlapping work hours
              </div>
              <p className="text-xs text-muted-foreground">
                Instantly see when 9-to-5 hours overlap across your
                team&apos;s cities.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="font-medium text-sm mb-1">
                Name your team members
              </div>
              <p className="text-xs text-muted-foreground">
                Add names to each city slot so everyone knows who&apos;s where.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="font-medium text-sm mb-1">
                Share a link — no sign-up
              </div>
              <p className="text-xs text-muted-foreground">
                Every comparison creates a unique URL you can share instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
