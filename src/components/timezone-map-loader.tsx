"use client";

import dynamic from "next/dynamic";

const TimezoneMap = dynamic(
  () =>
    import("@/components/timezone-map").then((mod) => ({
      default: mod.TimezoneMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-muted-foreground text-sm animate-pulse">
          Loading map…
        </div>
      </div>
    ),
  }
);

export function TimezoneMapLoader() {
  return <TimezoneMap />;
}
