import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { parsePlaceSlug, placeLabel, placeSlug } from "@/lib/share-time";
import { ShareTimeView } from "@/components/share-time-view";
import { SiteFooter } from "@/components/site-footer";

type Props = { params: Promise<{ place: string }> };

// Built on first visit, then cached until the next deploy. Nothing is prebuilt:
// these are personal share links, not SEO pages.
export const revalidate = false;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const place = parsePlaceSlug((await params).place);
  if (!place) return {};
  const title = `${placeLabel(place)} time — compare with yours`;
  const description = `See the time in ${placeLabel(place)} next to your own. Drag the slider to find a time that suits you both.`;
  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharePlacePage({ params }: Props) {
  const raw = (await params).place;
  const place = parsePlaceSlug(raw);
  if (!place) notFound();
  // One cached page per place: /compare/London and /compare/utc+05 redirect to the canonical slug.
  if (safeDecode(raw) !== placeSlug(place)) permanentRedirect(`/compare/${placeSlug(place)}`);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Timezones.live
          </Link>
          <span className="text-muted-foreground/40">|</span>
          <Link href="/compare" className="hover:text-foreground transition-colors">
            Compare
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          {placeLabel(place)} time vs yours
        </h1>
        <p className="text-muted-foreground mb-8">
          Drag any slider or tap a time to change it. Every row moves together.
        </p>

        <ShareTimeView shared={place} />
      </div>
      <SiteFooter />
    </main>
  );
}

function safeDecode(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
