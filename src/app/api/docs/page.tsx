import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Timezone API Documentation — Free Time & Compare API",
  description:
    "Free public API for querying current times and time differences between cities and timezones. No API key required.",
  alternates: { canonical: "https://timezones.live/api/docs" },
  openGraph: {
    title: "Timezone API Documentation | Timezones.live",
    description:
      "Free public API for querying current times and time differences between cities and timezones.",
    url: "https://timezones.live/api/docs",
    type: "website",
  },
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-sm leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function Endpoint({
  method,
  path,
  description,
  params,
  example,
  response,
}: {
  method: string;
  path: string;
  description: string;
  params: { name: string; required: boolean; description: string }[];
  example: string;
  response: string;
}) {
  return (
    <section className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="inline-block px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          {method}
        </span>
        <code className="text-base font-semibold font-mono">{path}</code>
      </div>
      <p className="text-muted-foreground">{description}</p>

      <div>
        <h4 className="text-sm font-semibold mb-2">Parameters</h4>
        <div className="space-y-1">
          {params.map((p) => (
            <div key={p.name} className="flex items-start gap-2 text-sm">
              <code className="font-mono text-foreground shrink-0">{p.name}</code>
              <span
                className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                  p.required
                    ? "bg-red-500/15 text-red-600 dark:text-red-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {p.required ? "required" : "optional"}
              </span>
              <span className="text-muted-foreground">{p.description}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Example Request</h4>
        <CodeBlock>{example}</CodeBlock>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Example Response</h4>
        <CodeBlock>{response}</CodeBlock>
      </div>
    </section>
  );
}

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
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

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Timezone API
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Free public API for querying current times and time differences
            between cities and timezones. No API key required.
          </p>
        </div>

        {/* Base URL */}
        <div className="border rounded-lg p-4 mb-8 bg-muted/30">
          <div className="text-sm text-muted-foreground mb-1">Base URL</div>
          <code className="text-base font-mono font-semibold">
            https://timezones.live/api/v1
          </code>
        </div>

        {/* Query formats */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Accepted Query Formats</h2>
          <p className="text-muted-foreground mb-3">
            Both endpoints accept flexible city/timezone identifiers:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {[
              { format: "City name", example: "london, tokyo" },
              { format: "City slug", example: "new-york, sao-paulo" },
              { format: "Timezone abbreviation", example: "PST, JST, GMT" },
              { format: "UTC offset", example: "utc+5, +9, utc-3:30" },
            ].map((item) => (
              <div
                key={item.format}
                className="flex items-start gap-2 border rounded-lg p-3"
              >
                <span className="font-medium shrink-0">{item.format}</span>
                <code className="text-muted-foreground">{item.example}</code>
              </div>
            ))}
          </div>
        </section>

        {/* Endpoints */}
        <h2 className="text-xl font-semibold mb-4">Endpoints</h2>
        <div className="space-y-6 mb-10">
          <Endpoint
            method="GET"
            path="/api/v1/time"
            description="Get the current time for a single city or timezone."
            params={[
              {
                name: "city",
                required: true,
                description:
                  "City name, slug, timezone abbreviation, or UTC offset",
              },
            ]}
            example={`curl "https://timezones.live/api/v1/time?city=london"`}
            response={JSON.stringify(
              {
                ok: true,
                data: {
                  city: "London",
                  country: "UK",
                  flag: "\ud83c\uddec\ud83c\udde7",
                  timezone: "Europe/London",
                  utcOffset: "UTC+0",
                  currentTime: "02:30 PM",
                  currentDate: "Fri Mar 7",
                  coordinates: { lat: 51.5074, lng: -0.1278 },
                },
              },
              null,
              2
            )}
          />

          <Endpoint
            method="GET"
            path="/api/v1/compare"
            description="Compare the current time between two cities or timezones."
            params={[
              {
                name: "from",
                required: true,
                description: "Source city name, slug, abbreviation, or UTC offset",
              },
              {
                name: "to",
                required: true,
                description: "Target city name, slug, abbreviation, or UTC offset",
              },
            ]}
            example={`curl "https://timezones.live/api/v1/compare?from=london&to=tokyo"`}
            response={JSON.stringify(
              {
                ok: true,
                data: {
                  from: {
                    city: "London",
                    country: "UK",
                    flag: "\ud83c\uddec\ud83c\udde7",
                    timezone: "Europe/London",
                    utcOffset: "UTC+0",
                    currentTime: "02:30 PM",
                    currentDate: "Fri Mar 7",
                    coordinates: { lat: 51.5074, lng: -0.1278 },
                  },
                  to: {
                    city: "Tokyo",
                    country: "Japan",
                    flag: "\ud83c\uddef\ud83c\uddf5",
                    timezone: "Asia/Tokyo",
                    utcOffset: "UTC+9",
                    currentTime: "11:30 PM",
                    currentDate: "Fri Mar 7",
                    coordinates: { lat: 35.6762, lng: 139.6503 },
                  },
                  difference: {
                    hours: 9,
                    description: "9 hours",
                    direction: "Tokyo is 9 hours ahead of London",
                  },
                },
              },
              null,
              2
            )}
          />
        </div>

        {/* Error Responses */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Error Responses</h2>
          <p className="text-muted-foreground mb-3">
            All errors return a consistent JSON format:
          </p>
          <CodeBlock>
            {JSON.stringify({ ok: false, error: "Error description" }, null, 2)}
          </CodeBlock>
          <div className="mt-4 border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { status: "400", meaning: "Missing required parameters" },
                  { status: "404", meaning: "City or timezone not found" },
                  { status: "429", meaning: "Rate limit exceeded (includes Retry-After header)" },
                  { status: "500", meaning: "Internal server error" },
                ].map((row) => (
                  <tr key={row.status} className="border-b last:border-b-0">
                    <td className="p-3">
                      <code className="font-mono">{row.status}</code>
                    </td>
                    <td className="p-3 text-muted-foreground">{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Rate Limiting */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Rate Limiting</h2>
          <div className="border rounded-lg p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Limit:</span>
              <span className="text-muted-foreground">
                100 requests per minute per IP address
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Header:</span>
              <code className="text-muted-foreground">Retry-After</code>
              <span className="text-muted-foreground">
                — seconds until the rate limit resets (included on 429 responses)
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-6 border-t">
          Part of{" "}
          <Link href="/" className="underline hover:text-foreground transition-colors">
            Timezones.live
          </Link>
        </div>
      </div>
    </main>
  );
}
