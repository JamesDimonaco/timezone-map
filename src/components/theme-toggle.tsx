"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  readThemePreference,
  setThemePreference,
  subscribeThemePreference,
  type ThemePreference,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const NEXT: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const LABEL: Record<ThemePreference, string> = {
  system: "Theme: match device",
  light: "Theme: light",
  dark: "Theme: dark",
};

const ICON = { system: Monitor, light: Sun, dark: Moon };

export function ThemeToggle({ className }: { className?: string }) {
  // Static pages render "system"; the stored choice is only known client-side.
  const pref = useSyncExternalStore(
    subscribeThemePreference,
    readThemePreference,
    () => "system" as const
  );

  const Icon = ICON[pref];
  return (
    <button
      type="button"
      onClick={() => setThemePreference(NEXT[pref])}
      aria-label={`${LABEL[pref]}. Click to change.`}
      title={LABEL[pref]}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
