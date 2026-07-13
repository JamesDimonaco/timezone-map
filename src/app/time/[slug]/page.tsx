import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllCitySlugs,
  getCityBySlug,
  parseComparisonSlug,
  generateComparisonSlugs,
  canonicalComparisonSlug,
  formatHourDifference,
  parseUtcOffsetHours,
} from "@/lib/slugs";
import { timezoneColors, countryFlag } from "@/lib/timezones";
import { CityPage } from "./city-page";
import { ComparisonPage } from "./comparison-page";

type Props = {
  params: Promise<{ slug: string }>;
};

// Fully static: these pages are derived entirely from the static city dataset
// (the live clock is a client component), so they only ever change on deploy.
// No runtime revalidation = no Fluid Compute on crawler traffic.
export const revalidate = false;

export async function generateStaticParams() {
  const citySlugs = getAllCitySlugs().map((slug) => ({ slug }));
  const comparisonSlugs = generateComparisonSlugs().map((slug) => ({ slug }));
  return [...citySlugs, ...comparisonSlugs];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Try city first
  const city = getCityBySlug(slug);
  if (city) {
    const flag = countryFlag(city.country);
    const title = `What time is it in ${city.name}? Current Local Time`;
    const description = `${flag} What time is it in ${city.name} right now? Live clock for ${city.name}, ${city.country} (${city.utcOffset}). Compare with any city & find meeting overlap.`;
    return {
      title,
      description,
      alternates: { canonical: `https://timezones.live/time/${slug}` },
      openGraph: {
        title,
        description,
        url: `https://timezones.live/time/${slug}`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  }

  // Try comparison
  const comparison = parseComparisonSlug(slug);
  if (comparison) {
    const { cityA, cityB } = comparison;
    const diff =
      parseUtcOffsetHours(cityB.utcOffset) -
      parseUtcOffsetHours(cityA.utcOffset);
    const absDiff = Math.abs(diff);
    const diffText = formatHourDifference(diff);
    const aheadBehind =
      diff > 0 ? "ahead of" : diff < 0 ? "behind" : "same as";
    const canonical = canonicalComparisonSlug(cityA, cityB);
    const title = `${cityA.name} to ${cityB.name} — ${formatHourDifference(absDiff)} Time Difference & Meeting Planner`;
    const description = `${cityA.name} is ${formatHourDifference(absDiff)} ${aheadBehind} ${cityB.name}. See both clocks live, find the best meeting times, and share a team timezone link.`;
    return {
      title,
      description,
      alternates: { canonical: `https://timezones.live/time/${canonical}` },
      openGraph: {
        title,
        description,
        url: `https://timezones.live/time/${canonical}`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  }

  return { title: "Not Found" };
}

export default async function TimePage({ params }: Props) {
  const { slug } = await params;

  // Try city
  const city = getCityBySlug(slug);
  if (city) {
    const color = timezoneColors[city.utcOffset] ?? "#60a5fa";
    return <CityPage city={city} color={color} slug={slug} />;
  }

  // Try comparison
  const comparison = parseComparisonSlug(slug);
  if (comparison) {
    const { cityA, cityB } = comparison;
    // Redirect non-canonical ordering to canonical
    const canonical = canonicalComparisonSlug(cityA, cityB);
    if (slug !== canonical) {
      redirect(`/time/${canonical}`);
    }
    const colorA = timezoneColors[cityA.utcOffset] ?? "#60a5fa";
    const colorB = timezoneColors[cityB.utcOffset] ?? "#60a5fa";
    return (
      <ComparisonPage
        cityA={cityA}
        cityB={cityB}
        colorA={colorA}
        colorB={colorB}
        slug={slug}
      />
    );
  }

  notFound();
}
