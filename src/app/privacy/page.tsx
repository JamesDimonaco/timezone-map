import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Timezones.live — how we handle your data, cookies, and third-party advertising.",
  alternates: { canonical: "https://timezones.live/privacy" },
};

export default function PrivacyPage() {
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
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: April 2026
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-3">Who we are</h2>
            <p className="text-muted-foreground">
              Timezones.live is a free, open timezone tool that helps people
              check current times around the world, compare time zones, and plan
              meetings across cities. The site is operated as an independent
              project.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Information we collect
            </h2>
            <p className="text-muted-foreground">
              Timezones.live does not require you to create an account or provide
              any personal information. We do not collect names, email addresses,
              or other personally identifiable information directly.
            </p>
            <p className="text-muted-foreground mt-2">
              When you visit the site, standard server logs may record your IP
              address, browser type, referring page, and the pages you visit.
              These logs are used solely for maintaining the service and
              diagnosing technical issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Cookies and advertising
            </h2>
            <p className="text-muted-foreground">
              We use Google AdSense to display advertisements on some pages of
              this site. Google and its advertising partners may use cookies and
              similar technologies to serve ads based on your prior visits to
              this site or other websites. These cookies allow Google to display
              personalised ads to you across the web.
            </p>
            <p className="text-muted-foreground mt-2">
              Specifically, Google uses cookies such as the DART cookie to serve
              ads based on your browsing activity. You can opt out of
              personalised advertising by visiting{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                Google Ads Settings
              </a>
              . You can also opt out of third-party vendor cookies by visiting{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                aboutads.info
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Third-party services
            </h2>
            <p className="text-muted-foreground">
              In addition to Google AdSense, we may use the following
              third-party services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
              <li>
                <strong>Google Analytics</strong> — to understand how visitors
                use the site (page views, session duration, general location).
                Google Analytics uses cookies to collect this data anonymously.
              </li>
              <li>
                <strong>MapLibre GL</strong> — for rendering the interactive
                map. Map tiles are loaded from third-party tile servers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Your timezone data
            </h2>
            <p className="text-muted-foreground">
              The quick converter feature reads your browser&apos;s timezone
              setting (via the{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                Intl.DateTimeFormat
              </code>{" "}
              API) to show times in your local timezone. This data stays in your
              browser and is never sent to our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data retention</h2>
            <p className="text-muted-foreground">
              We do not store personal data. Server logs are retained for a
              limited period for operational purposes and are then deleted.
              Cookies set by third-party services (Google AdSense, Analytics)
              are governed by their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Children&apos;s privacy
            </h2>
            <p className="text-muted-foreground">
              Timezones.live is a general-audience tool. We do not knowingly
              collect personal information from children under 13. If you
              believe a child has provided personal information, please contact
              us so we can remove it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Changes to this policy
            </h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. Changes will
              be posted on this page with an updated date. Continued use of the
              site after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-muted-foreground">
              If you have any questions about this privacy policy, you can reach
              us via the contact details on our{" "}
              <Link
                href="/about"
                className="underline hover:text-foreground transition-colors"
              >
                About page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
