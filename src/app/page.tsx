import { TimezoneMap } from "@/components/timezone-map";

export default function Home() {
  return (
    <main>
      <h1 className="sr-only">Timezones.live — Interactive World Timezone Map</h1>
      <p className="sr-only">
        Explore every world timezone on a beautiful interactive map. Click any
        region to see the current local time, UTC offset, and timezone
        abbreviation.
      </p>
      <TimezoneMap />
    </main>
  );
}
