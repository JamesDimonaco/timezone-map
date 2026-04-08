import Link from "next/link";
import { TimezoneMapLoader } from "@/components/timezone-map-loader";

export default function Home() {
  return (
    <main>
      <h1 className="sr-only">Timezones.live — Interactive World Timezone Map</h1>
      <p className="sr-only">
        Explore every world timezone on a beautiful interactive map. Click any
        region to see the current local time, UTC offset, and timezone
        abbreviation.
      </p>
      <TimezoneMapLoader />
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
          </nav>
        </div>
      </footer>
    </main>
  );
}
