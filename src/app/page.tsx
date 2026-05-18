import Link from "next/link";
import { TimezoneMapLoader } from "@/components/timezone-map-loader";
import { QuickConvert } from "@/components/quick-convert";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main>
      <h1 className="sr-only">
        Timezones.live — Interactive World Timezone Map
      </h1>
      <p className="sr-only">
        Explore every world timezone on an interactive map. Click any region to
        see the current local time, UTC offset, and timezone abbreviation.
        Convert times instantly with the search bar below.
      </p>
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
