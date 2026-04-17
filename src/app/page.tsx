import Link from "next/link";
import { TimezoneMapLoader } from "@/components/timezone-map-loader";
import { QuickConvert } from "@/components/quick-convert";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main>
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="max-w-2xl mx-auto px-4 pt-4 sm:pt-6 text-center">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground drop-shadow-md pointer-events-auto">
            Timezones.live — Interactive World Timezone Map
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 drop-shadow-sm pointer-events-auto">
            Explore every world timezone on an interactive map. Click any region
            to see the current local time, UTC offset, and timezone
            abbreviation. Convert times instantly with the search bar below.
          </p>
        </div>
      </div>
      <TimezoneMapLoader />
      <QuickConvert />
      <footer className="fixed bottom-14 sm:bottom-16 left-0 right-0 z-50 pointer-events-none">
        <div className="flex justify-center">
          <nav className="pointer-events-auto inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border text-xs text-muted-foreground">
            <Link href="/time" className="hover:text-foreground transition-colors">
              All Cities
            </Link>
            <span className="text-muted-foreground/30">|</span>
            <Link href="/compare" className="hover:text-foreground transition-colors">
              Team Planner
            </Link>
            <span className="text-muted-foreground/30">|</span>
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
        </div>
      </footer>
      <SiteFooter />
    </main>
  );
}
