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
    const title = `Current Time in ${city.name}, ${city.country}`;
    const description = `${flag} See the current local time in ${city.name}, ${city.country}. Timezone: ${city.timezone} (${city.utcOffset}). Live clock with timezone details.`;
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
    const diffText = formatHourDifference(diff);
    const canonical = canonicalComparisonSlug(cityA, cityB);
    const title = `Time Difference: ${cityA.name} to ${cityB.name}`;
    const description = `Compare the current time in ${cityA.name} (${cityA.utcOffset}) and ${cityB.name} (${cityB.utcOffset}). The time difference is ${diffText}.`;
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
