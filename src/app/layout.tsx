import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://timezones.live"),
  title: {
    default: "Timezones.live — Interactive World Timezone Map",
    template: "%s | Timezones.live",
  },
  description:
    "Explore every world timezone on a beautiful interactive map. Click any region to see the current local time, UTC offset, and timezone abbreviation — no sign-up required.",
  keywords: [
    "world timezone map",
    "interactive timezone map",
    "current time by timezone",
    "UTC offset map",
    "time zone converter",
    "world clock map",
    "timezone explorer",
    "global time zones",
    "timezone abbreviations",
    "international time zones",
    "time difference calculator",
    "timezone lookup",
  ],
  applicationName: "Timezones.live",
  authors: [{ name: "Timezones.live" }],
  creator: "Timezones.live",
  publisher: "Timezones.live",
  category: "Utilities",
  openGraph: {
    type: "website",
    url: "https://timezones.live",
    title: "Timezones.live — Interactive World Timezone Map",
    description:
      "Explore every world timezone on a beautiful interactive map. Click any region to see the current local time, UTC offset, and timezone abbreviation.",
    siteName: "Timezones.live",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Timezones.live — Interactive World Timezone Map",
    description:
      "Explore every world timezone on a beautiful interactive map. Click any region to see the current local time and UTC offset.",
  },
  alternates: {
    canonical: "https://timezones.live",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Timezones.live",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Timezones.live",
  url: "https://timezones.live",
  description:
    "Explore every world timezone on a beautiful interactive map. Click any region to see the current local time, UTC offset, and timezone abbreviation.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  browserRequirements: "Requires a modern web browser with JavaScript enabled",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
