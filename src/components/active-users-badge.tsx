"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ActiveUsersBadge() {
  const data = useQuery(api.presence.getActiveUsers);

  if (!data) return null;

  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <span className="relative flex size-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full size-1.5 bg-green-500" />
      </span>
      <span className="text-[10px] sm:text-xs text-muted-foreground tabular-nums">
        {data.count} {data.count === 1 ? "viewer" : "viewers"} online
      </span>
    </div>
  );
}
