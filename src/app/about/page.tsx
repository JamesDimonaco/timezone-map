import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "About Timezones.live",
  description:
    "Learn about Timezones.live — a free interactive timezone map, time converter, and meeting planner for remote teams.",
  alternates: { canonical: "https://timezones.live/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
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
          <span className="text-muted-foreground/40">|</span>
          <Link
            href="/compare"
            className="hover:text-foreground transition-colors"
          >
            Compare
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
          About Timezones.live
        </h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">What is this?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Timezones.live is a free, open tool for exploring the
              world&apos;s time zones. It combines an interactive map with a
              quick time converter and a team meeting planner — everything you
              need to coordinate across cities, all in one place with no
              sign-up required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Features</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-foreground/40" />
                <span>
                  <strong className="text-foreground">Interactive timezone map</strong>{" "}
                  — hover or click any region to see its current local time, UTC
                  offset, and timezone name. Day and night shading updates in
                  real time.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-foreground/40" />
                <span>
                  <strong className="text-foreground">Quick time converter</strong>{" "}
                  — type something like &quot;6pm London&quot; or &quot;3pm
                  EST&quot; and instantly see what time that is in your local
                  timezone.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-foreground/40" />
                <span>
                  <strong className="text-foreground">Team meeting planner</strong>{" "}
                  — compare up to 5 cities side-by-side, see overlapping work
                  hours, and share a direct link with your team.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-foreground/40" />
                <span>
                  <strong className="text-foreground">120+ cities</strong>{" "}
                  — browse current times across every major timezone, search by
                  city name, country, or UTC offset.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-foreground/40" />
                <span>
                  <strong className="text-foreground">Free public API</strong>{" "}
                  — query current times and time differences programmatically.
                  No API key required.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How it works</h2>
            <p className="text-muted-foreground leading-relaxed">
              The map uses timezone boundary data from the{" "}
              <a
                href="https://github.com/evansiroky/timezone-boundary-builder"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                timezone-boundary-builder
              </a>{" "}
              project, rendered with MapLibre GL. All time calculations use the
              browser&apos;s built-in{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                Intl.DateTimeFormat
              </code>{" "}
              API, which means times automatically adjust for daylight saving
              time in every region.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Who built this?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Timezones.live is an independent project built and maintained by
              James Dimonaco. It was created out of a need for a fast,
              visual way to check times around the world without the clutter
              of typical timezone websites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Got a suggestion, found a bug, or just want to say hello? You can
              reach out via the project&apos;s{" "}
              <a
                href="https://github.com/JamesDimonaco/timezone-map"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                GitHub repository
              </a>
              .
            </p>
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
